const process = require('process')
const path = require('path')
require('dotenv').config({path: path.join(__dirname,'../../.env')})

module.exports = {
    development: {
        port: process.env.PORT,
        host: process.env.HOST
    }
}