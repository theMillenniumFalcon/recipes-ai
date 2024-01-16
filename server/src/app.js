const express = require('express')
const app = express()

const connectDB = require('./database')
const { development } = require('./config/env')

app.use(express.json({
    limit: '50mb'
}))

const main = async () => {
    await connectDB()
    
    const server = app.listen(development.PORT, development.HOST, () => {
        console.log(`server listening on port ${development.PORT}`)
    })

    process.on('unhandledRejection', (err, promise) => {
        console.log(`Logged Error: ${err}`)
        server.close(() => process.exit(1))
    })
}
main().catch((error) => {
    console.error(error)
})