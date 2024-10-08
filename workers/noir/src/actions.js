import utilsObj from './utils.js';

const actionsObj = {};

actionsObj.cleanHangingImages = async (olderThan, env) => {
    try {
        console.log('Trying to clean hanging images...');

        // A request to the API to get the hanging images
        const response = await fetch(`${env.API_URL}/api/images/hangingImages?olderThan=${olderThan}`, {
            method: 'GET',
        });
    
        if (!response.ok) {
            throw new Error('Failed to fetch hanging images');
        }
    
        const documents = await response.json();

        let count = 0;
        for (let document of documents) {    
            if (document.img_url)	{
                let imageID = document.img_url.split('/').pop();

                utilsObj.deleteImage(imageID, env);

                const deleteResponse = await fetch(`${env.API_URL}/api/images/${document._id}`, {
                    method: 'DELETE',
                });
        
                if (!deleteResponse.ok) {
                    throw new Error(`Failed to delete document with ID ${document._id}`);
                }

                count++;
            }
        }

        console.log(`... Cleaned ${count} hanging images.`);
    } catch (error) {
        console.log('[ERR] Unable to clean hanging images:');
        console.log(error);
    }
}

actionsObj.cleanSuccessfulLogs = async (olderThan, env) => {
    try {
        console.log('Trying to clean success logs...');

        const deleteResponse = await fetch(`${env.API_URL}/api/logs/successful?olderThan=${olderThan}`, {
            method: 'DELETE',
        });

        console.log(`... Cleaned ${deleteResponse.deletedCount} success logs.`);
    } catch (error) {
        console.log('[ERR] Unable to clean success logs:');
        console.log(error);
    }
}

actionsObj.cleanUnsuccessfulLogs = async (olderThan, env) => {
    try {
        console.log('Trying to clean unsuccessful logs...');

        const deleteResponse = await fetch(`${env.API_URL}/api/logs/unsuccessful?olderThan=${olderThan}`, {
            method: 'DELETE',
        });

        console.log(`... Cleaned ${deleteResponse.deletedCount} unsuccessful logs.`);
    } catch (error) {
        console.log('[ERR] Unable to clean unsuccessful logs:');
        console.log(error);
    }
}

export default actionsObj;