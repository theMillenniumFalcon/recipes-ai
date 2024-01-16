const mongoose = require('mongoose')

const PendingSubmissionSchema = new mongoose.Schema({
    recipeId: {
        type: String,
        required: false
    },
    img_url: {
        type: String,
        required: false
    },
    is_pending: {
        type: Boolean,
        required: true
    },
    success: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    log: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

const PendingSubmission = mongoose.model("PendingSubmission", PendingSubmissionSchema)
module.exports = PendingSubmission