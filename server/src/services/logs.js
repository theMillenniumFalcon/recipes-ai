const PendingSubmission = require("../models/pendingSubmission")

let logsObj = {};

logsObj.deleteSuccessfulLogs = async (keywords) => {
    const olderThan = parseInt(keywords);

    try {
        await PendingSubmission.deleteMany({ 
            success: "true", 
            is_pending: false, 
            updatedAt: {
                $lt: new Date(new Date().getTime() - olderThan)
            }
        });
    
        return {code: 200, msg: `Deleted successful logs.`}
    } catch (error) {
        console.error(error);
        return { code: 404, msg: "Could not delete logs."}
    }
}

logsObj.deleteUnsuccessfulLogs = async (keywords) => {
    const olderThan = parseInt(keywords);

    try {
        await PendingSubmission.deleteMany({ 
            success: "false", 
            updatedAt: {
                $lt: new Date(new Date().getTime() - olderThan)
            }
        });
    
        return {code: 200, msg: `Deleted unsuccessful logs.`}
    } catch (error) {
        console.error(error);
        return { code: 404, msg: "Could not delete logs."}
    }
}

module.exports = logsObj;