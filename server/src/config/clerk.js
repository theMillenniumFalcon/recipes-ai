const Clerk = require('@clerk/clerk-sdk-node/cjs/instance').default

const { development } = require('./env')

const clerkConfig = Clerk({ secretKey: development.CLERK_SECRET_KEY })

module.exports = clerkConfig