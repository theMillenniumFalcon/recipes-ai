const utilsObj = {};

utilsObj.removeImage = (imageId, env) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ID}/images/v1/${imageId}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${env.CLOUDFLARE_TOKEN}`
                }
            });
            resolve();
        } catch (error) {
            console.error(error);
            reject();
        }
    });
}

export default utilsObj;