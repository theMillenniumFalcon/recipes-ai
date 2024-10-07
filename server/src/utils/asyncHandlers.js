// For realtime data processing after a HTTP response is served.
const axios = require("axios")

const aiObj = require("../ai/gptAndDalle")
const promptsObj = require("../ai/prompts")
const helpers = require("./helpers")
const { development } = require('../config/env')

const PendingSubmission = require("../models/pendingSubmission")
const Recipe = require("../models/recipe")

const asyncHandlersObj = {}

asyncHandlersObj.addRecipe = async(stepsString, input, retriesCount = 0) => {
    try {
        let unprocessedData = `Recipe Name: ${input.name}, Author: ${input.author}, Steps: ${stepsString}`
        let instructions = [
            promptsObj.recipeIngredientsArray, 
            promptsObj.recipeIngredients, 
            promptsObj.recipeContext(unprocessedData)
        ]
        let ingredients = await aiObj.gpt(instructions)
        await helpers.validateIngredients(ingredients)

        let santisedIngredients = await helpers.sanitiseIngredients(ingredients, input.steps)
        if (!santisedIngredients.valid) throw new Error("Invalid Ingredients.")
        await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
            stage: "Analysing recipe & writing metadata..."
        })

        let ingredientString = ''
        santisedIngredients.list.forEach((ingredient, i) => ingredientString += `(${i+1}) ${ingredient.name} `)
        unprocessedData = `Recipe Name: ${input.name}, Author: ${input.author}, Ingredients: ${ingredientString} Steps: ${stepsString}`
        instructions = [
            promptsObj.recipeObject, 
            promptsObj.allRecipeMetadata,
            promptsObj.recipeContext(unprocessedData)
        ]
    
        let newRecipe = await aiObj.gpt(instructions)
        
        newRecipe.ingredients = santisedIngredients.list
        newRecipe.diet = helpers.getRecipeDietType(newRecipe.ingredients)

        if (!helpers.isRecipeOutputValid(newRecipe)) throw new Error("Validation Failed.")

        newRecipe.name = input.name
        newRecipe.author = input.author
        newRecipe.cooking_time = input.cookingTime
        newRecipe.steps = input.steps
        newRecipe.userId = input.userId

        if (!input.generateImage) {
            const submissionData = await PendingSubmission.findOne({_id: input.submission_id})
            newRecipe.img_url = submissionData.img_url

            const submittedRecipe = await Recipe.create(newRecipe)
            await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
                stage: "Done - Recipe analysis & writing metadata.",
                is_pending: false,
                success: true,
                recipeId: submittedRecipe._id
            })
            return
        }

        await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
            stage: "Visualising recipe & generating image..."
        })

        asyncHandlersObj.generateRecipeImage(newRecipe, input)
    } catch (error) {
        console.log(error)
        if (retriesCount === 0) {
            asyncHandlersObj.addRecipe(stepsString, input, retriesCount + 1)
            return
        }

        await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
            stage: "Error during recipe analysis.",
            is_pending: false,
            success: false,
            log: error
        })
    }
}

asyncHandlersObj.generateRecipeImage = async(newRecipe, input) => {
    try {
        const response = await aiObj.dalle(newRecipe.prompt)
        const {data} = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${development.CLOUDFLARE_ID}/images/v1`, {
                url: response[0].url
            }, {
                headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${development.CLOUDFLARE_TOKEN}`
                }
            }
        )
        
        if (!data.success) throw new Error("CLOUDFLARE IMAGE UPLOAD ERR0R")

        delete newRecipe.prompt
        newRecipe.img_url = `https://imagedelivery.net/CwcWai9Vz5sYV9GCN-o2Vg/${data.result.id}/`

        const submittedRecipe = await Recipe.create(newRecipe)
        await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
            stage: "Done - Visualising recipe & generating image...",
            is_pending: false,
            success: true,
            recipeId: submittedRecipe._id
        })
    } catch (error) {
        // TODO: improve error handling
        await PendingSubmission.findOneAndUpdate({_id: input.submission_id}, {
            stage: "error during image generation",
            is_pending: false,
            success: false,
            log: error,
        })
    }
}

asyncHandlersObj.updateRecipeInsights = async(stepsString, input, retries = 0) => {
    try {
        let unprocessedData = `Recipe Name: ${input.name}, Author: ${input.author}, Steps: ${stepsString}`

        let instruction = [
            promptsObj.recipeObject, 
            promptsObj.recipeInsightsOnly, 
            promptsObj.recipeContext(unprocessedData)
        ]
    
        let updatedInsights = await aiObj.gpt(instruction)

        if (!helpers.isRecipeOutputValid(updatedInsights, 'insights')) throw new Error("Validation Failed.")

        console.log(updatedInsights)
        console.log(input._id)
        await Recipe.findOneAndUpdate({_id: input._id}, {
            allergies: updatedInsights.allergies,
            health_reason: updatedInsights.health_reason,
            health_score: updatedInsights.health_score
        })
    } catch (error) {
        console.log(error)

        if (retries < 1) {
            asyncHandlersObj.updateRecipeInsights(stepsString, input, retries + 1)
            return
        }
    }
}

module.exports = asyncHandlersObj