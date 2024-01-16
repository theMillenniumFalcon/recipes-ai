const PendingSubmission = require("../models/pendingSubmission")

// Service for fetching status of pending submissions
const submissionsObj = {}
submissionsObj.status = (id) => {
    return new Promise(async(resolve) => {
        try {
            let submission = await PendingSubmission.findOne({ _id: id })
            resolve({ 
                code: 200, 
                data: submission
            })
        } catch (error) {
            resolve({ 
                code: 500, 
                msg: "Could not retrive data from data store"
            })
        }
    })
}

export default submissionsObj