const express = require('express')
const multer = require('multer')
const { CloudflareStorage } = require('multer-cloudflare-storage')

const connectDB = require('./database')

const { development } = require('./config/env')
const clerkConfig = require('./config/clerk')

const recipesObj = require('./services/recipes')
const searchObj = require('./services/search')
const submissionsObj = require('./services/submissions')
const imagesObj = require('./services/images')

let startTime = Date.now()

const app = express()

app.use(express.json({
    limit: '50mb'
}))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'accept, authorization, content-type, x-requested-with')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', true)

    next()
})

const main = async () => {
    await connectDB()

    // Utilities
    const unauthenticated = (res) => {
        res.statusCode = 401
        res.json({code: 401, msg: 'session expired or invalid'})
    }

    const upload = multer({
        storage: new CloudflareStorage(development.CLOUDFLARE_ID, development.CLOUDFLARE_TOKEN)
    }).single("image")

    // Endpoints
    app.get('/status', async (req, res) => {
        if (startTime) {
            let currentTime = Date.now()
            let uptime = currentTime - startTime
    
            // Convert uptime to a human-readable format (hours, minutes, seconds)
            let uptimeSeconds = Math.floor(uptime / 1000)
            let uptimeMinutes = Math.floor(uptimeSeconds / 60)
            let uptimeHours = Math.floor(uptimeMinutes / 60)
            let formattedUptime = `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
    
            res.json({
                code: 200,
                name: 'Recipes.AI API',
                status: 'Operational',
                startTime: new Date(startTime).toLocaleString('en-IN') + ' (Server Time - UTC)',
                uptime: formattedUptime 
            })
        } else {
            res.statusCode = 500
            res.json({
                code: 500,
                name: 'Recipes.AI API',
                status: 'Requires Attention'
            })
        }
    })

    app.get('/api/recipes/:skip/:limit', async (req, res) => {
        const retrievedData = await recipesObj.get({
            skip: req.params.skip,
            limit: req.params.limit
        })
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.get('/api/recipes/:idx', async (req, res) => {
        const retrievedData = await recipesObj.get({ idx: req.params.idx })
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.post('/api/recipes', clerkConfig.expressWithAuth({}), async (req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        const user = await clerkConfig.users.getUser(req.auth.userId)
        req.body.author = `${user.firstName} ${user.lastName}`
        req.body.userId = user.id

        const response = await recipesObj.add(req.body)
        res.statusCode = response.code
        res.json(response)
    })

    app.put('/api/recipes', clerkConfig.expressWithAuth({}), async (req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        const user = await clerkConfig.users.getUser(req.auth.userId)
        req.body.author = `${user.firstName} ${user.lastName}`
        req.body.userId = user.id
        
        const response = await recipesObj.update(req.body)
        res.statusCode = response.code
        res.json(response)
    })

    app.post('/api/recipes/images/upload', clerkConfig.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        upload(req, res, async(err) => {
            if (err instanceof multer.MulterError) {
                res.statusCode = 406
                res.json({code: 406, msg: "UNEXPECTED FILE: Please ensure the file is an image file & less than 10MB."})
                return
            } else if (err) {
                console.log(err)
                res.statusCode = 500
                res.json({code: 500, msg: "Internal Server Error, Please try again later."})
                return
            }

            const response = await recipesObj.addImage(req.file)
            res.statusCode = response.code
            res.json(response)
        })
    })

    app.put('/api/recipes/images/upload/:idx', clerkConfig.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
        
        upload(req, res, async(err) => {
            if (err instanceof multer.MulterError) {
                res.statusCode = 406
                res.json({code: 406, msg: "UNEXPECTED FILE: Please ensure the file is an image file & less than 10MB.", code: err.code})
                return
            } else if (err) {
                console.log(err)
                res.statusCode = 500
                res.json({code: 500, msg: "Internal Server Error, Please try again later.", code: err.code})
                return
            }

            const response = await recipesObj.updateImage(req.file, req.params.idx, req.auth.userId)
            res.statusCode = response.code
            res.json(response)
        })
    })

    app.delete('/api/recipes/:idx', clerkConfig.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
    
        const response = await recipesObj.delete(req.params.idx)
        res.statusCode = response.code
        res.json(response)
    })

    app.get('/api/recipes/user/:skip/:limit', clerkConfig.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        const retrievedData = await recipesObj.getByUser({
            userId: req.auth.userId,
            skip: req.params.skip,
            limit: req.params.limit
        })
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.get('/api/search/:skip/:limit', async (req, res) => {
        const retrievedData = await searchObj.query(req.query.q, req.params.skip, req.params.limit)
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.get('/api/submissions/:id', async (req, res) => {
        const retrievedData = await submissionsObj.status(req.params.id)
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.get('/api/images/hangingImages', async (req, res) => {
        const retrievedData = await imagesObj.getHangingImages(req.query.olderThan)
        res.statusCode = retrievedData.code

        res.json(retrievedData.data)
    })

    app.delete('/api/images/:idx', clerkConfig.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
    
        const response = await imagesObj.delete(req.params.idx)
        res.statusCode = response.code
        res.json(response)
    })
    
    const server = app.listen(development.PORT, development.HOST, () => {
        console.log(`server listening on port ${development.PORT} and host ${development.HOST}`)
    })

    process.on('unhandledRejection', (err, promise) => {
        console.log(`Logged Error: ${err}`)
        server.close(() => process.exit(1))
    })
}
main().catch((error) => {
    console.error(error)
})