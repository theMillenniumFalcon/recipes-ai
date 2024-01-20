const { development } = require("../config/env")
const PendingSubmission = require("../models/pendingSubmission")
const Recipe = require("../models/recipe")

const recipesObj = {}
recipesObj.addImage = async(input) => {
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

recipes.updateImage = async(input, idx, userId) => {
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