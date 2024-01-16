const mongoose = require('mongoose')

const { development } = require('../config')

const connectDB = async() => {
    try {
        await mongoose.connect(development.DATABASE_URL, {})
        console.log('database connected')
    } catch (error) {
        console.error('could not be connected to a database:', error.message)
    }
}

module.exports = connectDB