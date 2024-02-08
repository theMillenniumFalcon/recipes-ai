const express = require('express')
const app = express()
const { Clerk } = require('@clerk/clerk-sdk-node')

const connectDB = require('./database')
const { development } = require('./config/env')

const multer = require('multer')
const { CloudflareStorage } = require('multer-cloudflare-storage')
const clerk = new Clerk({ apiKey: development.CLERK_API_KEY })

let startTime = null

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
    app.get('/status',async(req, res) => {
        if (startTime) {
            res.json({code: 200, name: 'Recipes + AI (API)', status: `Operational`, startTime: `${startTime.toLocaleString('en-CA')} (Server Time - UTC)`})
        } else {
            res.statusCode = 500
            res.json({code: 500, name: 'Recipes + AI (API)', status: `Requires Attention`})
        }
    })

    app.get('/api/recipes/:skip/:limit', async(req, res) => {
        const retrivedData = await recipes.get({skip: req.params.skip, limit: req.params.limit})
        res.statusCode = retrivedData.code

        res.json(retrivedData.data)
    })

    app.get('/api/recipes/:idx',async(req, res) => {
        const retrivedData = await recipes.get({ idx: req.params.idx })
        res.statusCode = retrivedData.code
        res.json(retrivedData.data)
    })

    app.post('/api/recipes', clerk.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        const user = await clerk.users.getUser(req.auth.userId)
        req.body.author = `${user.firstName} ${user.lastName}`
        req.body.userId = user.id

        const response = await recipes.add(req.body)
        res.statusCode = response.code
        res.json(response)
    })

    app.put('/api/recipes', clerk.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
        const user = await clerk.users.getUser(req.auth.userId)
        req.body.author = `${user.firstName} ${user.lastName}`
        req.body.userId = user.id
        
        const response = await recipes.update(req.body)
        res.statusCode = response.code
        res.json(response)
    })

    app.post('/api/recipes/images/upload', clerk.expressWithAuth({}), async(req, res) => {
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

            const response = await recipes.addImage(req.file)
            res.statusCode = response.code
            res.json(response)
        })
    })

    app.put('/api/recipes/images/upload/:idx', clerk.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
        // fix
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

            const response = await recipes.updateImage(req.file, req.params.idx, req.auth.userId)
            res.statusCode = response.code
            res.json(response)
        })
    })

    app.delete('/api/recipes/:idx', clerk.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)
    
        const response = await recipes.delete(req.params.idx)
        res.statusCode = response.code
        res.json(response)
    })

    app.get('/api/recipes/user/:skip/:limit', clerk.expressWithAuth({}), async(req, res) => {
        if (!req.auth.sessionId) return unauthenticated(res)

        const retrivedData = await recipes.getByUser({userId: req.auth.userId, skip: req.params.skip, limit: req.params.limit})
        res.statusCode = retrivedData.code

        res.json(retrivedData.data)
    })

    app.get('/api/search/:skip/:limit',async(req, res) => {
        const filters = (req.query.diet) ? {diet : req.query.diet}: {}
        const retrivedData = await search.query(req.query.q, filters, req.params.skip, req.params.limit)
        console.log(req.query.q)
        res.statusCode = retrivedData.code

        res.json(retrivedData.data)
    })

    app.get('/api/submissions/:id', async(req, res) => {
        // if (!req.auth.sessionId) return unauthenticated(res)
        const retrivedData = await submissions.status(req.params.id)
        res.statusCode = retrivedData.code

        res.json(retrivedData.data)
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