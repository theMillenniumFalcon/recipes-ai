const { OpenAI } = require("openai")

const { development } = require('./env')

const openAIConfig = new OpenAI({
    apiKey: development.OPENAI_KEY,
    logLevel: 'silent'
})

module.exports = openAIConfig