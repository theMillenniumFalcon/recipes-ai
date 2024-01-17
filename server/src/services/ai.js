const { default: openAIConfig } = require("../config/openai")

const aiObj = {}
aiObj.gpt = ((instruction) => {

    return new Promise((resolve, reject) => {
        openAIConfig.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: instruction,
            temperature: 0
        }).then((res) => {
            const output = JSON.parse(res.data.choices[0].message.content)
            resolve(output)
        }).catch((err) => {
            console.log("Failed to generate or parse output from GPT-3.")
            console.log(err.response.data)
            reject(err)
        })
    })
})

aiObj.dalle = ((prompt) => {
    return new Promise((resolve, reject) => {
        openAIConfig.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        }).then((res) => {
            const output = res.data.data
            resolve(output)
        }).catch((err) => {
            console.log("Failed to generate or parse output from DALL-E.")
            console.log(err.response.data)
            reject(err)
        })
    })
})

export { aiObj }