const axios = require('axios')

const promptsObj = require("../ai/prompts")
const { development } = require("../config/env")
const asyncHandlersObj = require("../utils/asyncHandlers")
const helpersObj = require("../utils/helpers")
const PendingSubmission = require("../models/pendingSubmission")
const Recipe = require("../models/recipe")

const recipesObj = {}

recipesObj.add = async (input) => {
    return new Promise(async(resolve) => {
        try {           
            // Preparing Prompt
            let stepsString = ''
            input.steps.forEach((step, i) => stepsString += `[STEP ${i+1}] ${step} `)
    
            let unprocessedData = `Recipe Name: ${input.name}, Author: ${input.author}, Steps: ${stepsString}`
            
            let prompt = [promptsObj.recipeObject, promptsObj.recipeSpamCheck, promptsObj.recipeContext(unprocessedData)]
    
            // Spam Analysis
            const spamAnalysis = await ai.gpt(prompt)
            
            console.log(spamAnalysis)

            if (spamAnalysis.spam_score >= 5) {
                resolve({ code: 200, spam: true, msg: `${spamAnalysis.score_reason}`})
                return
            }

            // Initiating background processing chain, if submission is not spam.
            if (input.submission_id) { // Submission ID already exists (when user has submitted a cover image)
                await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {stage: "Identifying & sorting ingredients..."})
                input.generateImage = false
            } else { // No Submission ID; cover image also needs to be generated
                let newPendingSubmission = {
                    is_pending: true,
                    success: true,
                    stage: "Identifying & sorting ingredients..."
                }

                const submission = await PendingSubmission.create(newPendingSubmission)
                input.submission_id = submission._id
                input.generateImage = true
            }

            asyncHandlersObj.addRecipe(stepsString, input)

            resolve({code: 200, msg: "Submission sent for further processing.", submission_id: input.submission_id})
        } catch (error) {
            console.log(error)
            return { code: 500, msg: "Could not add item"}
        }
    })
}

recipesObj.addImage = async (input) => {
    return new Promise(async(resolve) => {
        try {
            let newPendingSubmission = {
                img_url: `https://imagedelivery.net/CwcWai9Vz5sYV9GCN-o2Vg/${input.destination}`,
                is_pending: true,
                success: true,
                stage: "Image Uploaded by User"
            }
            
            const submission = await PendingSubmission.create(newPendingSubmission)

            resolve({code: 201, submission_id: submission._id})
        } catch (error) {
            resolve({ code: 500, msg: "Could not create submission."})
        }
    })
}

recipesObj.updateImage = async (input, idx, userId) => {
    return new Promise(async(resolve) => {
        try {
            const recipe = await Recipe.findOne({_id: idx})
            if (recipe.userId !== userId) throw new Error("401")
            await Recipe.findOneAndUpdate({_id: idx}, {img_url: `https://imagedelivery.net/CwcWai9Vz5sYV9GCN-o2Vg/${input.destination}`})

            // Delete old image from cloudflare
            if (!recipe.img_url) return
            const imgInfo = recipe.img_url.split('/')
            const options = {
                method: 'DELETE',
                url: `https://api.cloudflare.com/client/v4/accounts/${development.CLOUDFLARE_ID}/images/v1/${imgInfo[4]}`,
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${development.CLOUDFLARE_TOKEN}`}
            }
            await axios.request(options)

            resolve({code: 200})
        } catch (error) {
            if (error.message === "401") { 
                resolve({ code: 401, msg: "You are not authorised to edit this recipe."})
                return
            }

            resolve({ code: 500, msg: "Could not create submission."})
        }
    })
}

recipesObj.update = async (input) => {
    return new Promise(async(resolve) => {
        try {
            // fetch old recipe data
            const oldRecipe = await db.Recipe.findOne({_id: input._id})

            // check if recipe belongs to user
            if (oldRecipe.userId !== input.userId) throw new Error("401")
            
            // Preparing Prompt
            let stepsString = ''
            input.steps.forEach((step, i) => stepsString += `[STEP ${i + 1}] ${step} `)
    
            const unprocessedData = `Recipe Name: ${input.name}, Author: ${input.author}, Steps: ${stepsString}`
            const instruction = [prompts.recipeObject, prompts.recipeSpamCheck, prompts.recipeContext(unprocessedData)]
    
            // Spam Analysis
            const spamAnalysis = await ai.gpt(instruction)
            
            console.log(spamAnalysis)

            if (spamAnalysis.spam_score >= 5) {
                resolve({ code: 200, spam: true, msg: `${spamAnalysis.score_reason}`})
                return
            }

            // use helper to validate and sanitise ingredients
            let areIngredientsValid = await helpersObj.validateIngredients(input.ingredients, input.steps)

            if (!areIngredientsValid) throw new Error("Validation Failed.")

            // use helper to get diet type
            input.diet = helpersObj.getRecipeDietType(input.ingredients)
            console.log(input.diet)
            console.log(input.ingredients)

            // use helper to validate recipe output
            if (!helpersObj.isRecipeOutputValid(input)) throw new Error("Validation Failed.")

            // update steps, ingredients, name, desc, intro, cooking_time
            await db.Recipe.findOneAndUpdate({_id: input._id}, {
                steps: input.steps,
                ingredients: input.ingredients,
                name: input.name,
                desc: input.desc,
                intro: input.intro,
                cooking_time: input.cookingTime,
                diet: input.diet
            })

            // compare old recipe data with new recipe data
            let areStepsChanged = oldRecipe.steps.toString() !== input.steps.toString()
            let areIngredientsChanged = oldRecipe.ingredients.toString() !== input.ingredients.toString()

            // Initiating background processing chain to update insights, if steps or ingredients have changed.
            if (areStepsChanged || areIngredientsChanged) {
                asyncHandlersObj.updateRecipeInsights(stepsString, input)
            }

            resolve({code: 200, msg: "Edit has been saved."})
        } catch (error) {
            console.log(error)
            if (error.message === "401") {
                resolve({ code: 401, msg: "You are not authorised to edit this recipe."})
                return
            }
            resolve({ code: 500, msg: "Could not update recipe"})
        }
    })
}

recipesObj.get = async (args = {}) => {
    try {
        let recipeData = []
        let count = 0
        let data = {}

        if (args['idx']) {
            recipeData = await Recipe.findOne({ _id: args['idx'] })
            data = recipeData
        } else {
            recipeData = await Recipe.find()
            .select('_id name author diet img_url desc').sort({ _id: -1 })
            .skip(args.skip).limit(args.limit)

            count = await Recipe.countDocuments()
            data = {
                count: count,
                recipes: recipeData
            }
        }

        return { code: 200, data }
    } catch (error) {   
        return { code: 500, msg: error.message }
    }
}

recipesObj.delete = async (idx) => {
    try {
        const recipeData = await Recipe.findOne({ _id: idx })
        try {
            // Delete image from cloudflare
            if (!recipeData.img_url) return

            const imgInfo = recipeData.img_url.split('/')
            const options = {
                method: 'DELETE',
                url: `https://api.cloudflare.com/client/v4/accounts/${development.CLOUDFLARE_ID}/images/v1/${imgInfo[4]}`,
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${development.CLOUDFLARE_TOKEN}`}
            }

            await axios.request(options)
        } catch (e) {
            console.time("RECIPE IMAGE DELETE ERROR")
            console.log(`[> RECIPE IMAGE DELETE ERROR DETAILS] ${e}`)
        }
        
        await Recipe.deleteOne({ _id: idx })

        return {code: 200, msg: `Deleted item with _id ${idx}.`}
    } catch (error) {
        console.time("RECIPE DELETE ERROR")
        console.log(`[> RECIPE DELETE ERROR DETAILS] ${error}`)
        
        return { code: 404, msg: "Could not delete item, please try again later."}
    }
}

recipesObj.getByUser = async ({userId, limit, skip}) => {
    try {
        let recipeData = []
        let count = 0
        let data = {}

        recipeData = await Recipe.find({userId: userId})
            .select('_id name author diet img_url desc').sort({_id: -1})
            .skip(skip).limit(limit)

            count = await Recipe.find({userId: userId}).count()
            data = {count: count, recipes: recipeData}
            
        return {code: 200, data: data}
    } catch (error) {
        return { code: 500, msg: "Could not retrive data from data store"}
    }
}

module.exports = recipesObj