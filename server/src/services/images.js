const PendingSubmission = require("../models/pendingSubmission")

const imagesObj = {}

imagesObj.getHangingImages = async (keywords) => {
    const olderThan = parseInt(keywords)

    try {
        let imageData = []
        let data = {}

        imageData = await PendingSubmission.find({ 
            success: "true", 
            is_pending: true, 
            updatedAt: {
                $lt: new Date(new Date().getTime() - olderThan)
            }
        })
        data = imageData

        return { code: 200, data }
    } catch (error) {   
        return { code: 500, msg: error.message }
    }
}

imageObj.delete = async (idx) => {
    try {
        await PendingSubmission.deleteOne({ _id: new MongoClient.ObjectID(idx) })
    
        return {code: 200, msg: `Deleted item with _id ${idx}.`}
      } catch (error) {
        console.error(error);
        return { code: 404, msg: "Could not delete item, please try again later."}
      }
}

module.exports = imagesObj