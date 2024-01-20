const process = require('process')
const path = require('path')
require('dotenv').config({path: path.join(__dirname,'../../.env')})

module.exports = {
    development: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        DATABASE_URL: process.env.DATABASE_URL,
        CLERK_API_KEY: process.env.CLERK_API_KEY,
        OPENAI_KEY: process.env.OPENAI_KEY,
        CLOUDFLARE_ID: process.env.CLOUDFLARE_ID,
        CLOUDFLARE_TOKEN: process.env.CLOUDFLARE_TOKEN
    }
}