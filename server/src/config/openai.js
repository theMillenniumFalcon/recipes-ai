import { OpenAIApi, Configuration } from 'openai'

const { development } = require('./env')

const openAIConfig = new OpenAIApi(
    new Configuration({
        apiKey: development.OPENAI_KEY,
        logLevel: 'silent'
    })
)

export default openAIConfig