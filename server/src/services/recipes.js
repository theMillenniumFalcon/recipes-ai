const PendingSubmission = require("../models/pendingSubmission")

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