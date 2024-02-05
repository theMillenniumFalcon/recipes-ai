const Clerk = require('@clerk/clerk-sdk-node')

const { development } = require('./env')

const clerkConfig = new Clerk({ apiKey: development.CLERK_API_KEY })

export default clerkConfig