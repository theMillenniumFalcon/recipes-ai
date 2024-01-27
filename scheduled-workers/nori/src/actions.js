const actionsObj = {}

actionsObj.cleanSuccessLogs = async(collection, olderThan) => {
    try {
        console.log('Trying to clean success logs...')
        let result = await collection.deleteMany({ 
            success: "true", 
            is_pending: false,
            updatedAt: {
                $lt: new Date(new Date().getTime() - olderThan)
            }
        })
        console.log(`... Cleaned ${result.deletedCount} success logs.`)
    } catch (error) {
        console.log('[ERR] Unable to clean success logs:')
        console.log(error)
    }
}

export default actionsObj