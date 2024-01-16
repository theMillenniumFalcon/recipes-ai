import { Clerk } from '@clerk/clerk-sdk-node'

const { development } = require('../config')

const clerk = new Clerk({ apiKey: development.CLERK_API_KEY })

export default clerk