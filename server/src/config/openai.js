const { OpenAIApi, Configuration } = require("openai")

const { development } = require('./env')

const openAIConfig = new OpenAIApi(
    new Configuration({
        apiKey: development.OPENAI_KEY,
        logLevel: 'silent'
    })
)

export default openAIConfig