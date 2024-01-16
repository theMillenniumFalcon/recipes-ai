const express = require('express')
const app = express()

const { development } = require('./config')

const PORT = development.port || 4000 
const HOST = development.host || '127.0.0.1'

app.use(express.json({
    limit: '50mb'
}))

const main = async () => {
    const server = app.listen(PORT, HOST, () => {
        console.log(`server listening on port ${PORT}`)
    })

    process.on('unhandledRejection', (err, promise) => {
        console.log(`Logged Error: ${err}`)
        server.close(() => process.exit(1))
    })
}
main().catch((error) => {
    console.error(error)
})