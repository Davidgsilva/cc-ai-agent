import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase() {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DATABASE || 'cc-ai-agent')
}

export async function getUserByEmail(email) {
  const db = await getDatabase()
  return await db.collection('users').findOne({ email })
}

export async function createUser(userData) {
  const db = await getDatabase()
  const user = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: userData.provider === 'google' ? true : false,
    verificationToken: userData.provider === 'google' ? null : userData.verificationToken || null
  }
  
  const result = await db.collection('users').insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function updateUser(email, updates) {
  const db = await getDatabase()
  const result = await db.collection('users').updateOne(
    { email },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  )
  return result.modifiedCount > 0
}

export async function setVerificationToken(email, token) {
  const db = await getDatabase()
  return await db.collection('users').updateOne(
    { email },
    { 
      $set: { 
        verificationToken: token,
        updatedAt: new Date()
      } 
    }
  )
}

export async function verifyEmail(token) {
  const db = await getDatabase()
  const result = await db.collection('users').updateOne(
    { verificationToken: token },
    { 
      $set: { 
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date()
      } 
    }
  )
  return result.modifiedCount > 0
}