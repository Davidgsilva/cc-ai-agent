import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

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
  return client.db(process.env.MONGODB_DB_NAME)
}

export async function getUserByEmail(email) {
  if (!email) return null
  
  const db = await getDatabase()
  return await db.collection('users').findOne({ 
    email: email.toLowerCase().trim() 
  })
}

export async function createUser(userData) {
  const db = await getDatabase()
  
  // Validate required fields
  if (!userData.email) {
    throw new Error('Email is required')
  }
  
  // Check if user already exists
  const existingUser = await getUserByEmail(userData.email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  // Create user document with proper schema
  const user = {
    email: userData.email.toLowerCase().trim(),
    name: userData.name?.trim() || null,
    image: userData.image || null,
    provider: userData.provider || 'credentials',
    providerId: userData.providerId || null,
    password: userData.password || null, // Only for credentials provider
    emailVerified: userData.provider === 'google' ? true : false,
    verificationToken: userData.provider === 'google' ? null : userData.verificationToken || null,
    role: 'user',
    isActive: true,
    preferences: {
      theme: 'system',
      notifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  try {
    const result = await db.collection('users').insertOne(user)
    return { ...user, _id: result.insertedId }
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User with this email already exists')
    }
    throw error
  }
}

export async function updateUser(email, updates) {
  if (!email) {
    throw new Error('Email is required')
  }
  
  const db = await getDatabase()
  
  // Remove sensitive fields that shouldn't be updated directly
  const { _id, createdAt, ...safeUpdates } = updates
  
  const result = await db.collection('users').updateOne(
    { email: email.toLowerCase().trim() },
    { 
      $set: { 
        ...safeUpdates, 
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

// Initialize database indexes for optimal performance
export async function initializeDatabase() {
  const db = await getDatabase()
  const users = db.collection('users')
  
  try {
    // Create unique index on email
    await users.createIndex({ email: 1 }, { unique: true })
    
    // Create index on verification token for faster lookups
    await users.createIndex({ verificationToken: 1 }, { sparse: true })
    
    // Create index on provider + providerId for OAuth users
    await users.createIndex({ provider: 1, providerId: 1 }, { sparse: true })
    
    // Create index on createdAt for sorting
    await users.createIndex({ createdAt: -1 })
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.log('ℹ️ Database indexes already exist or creation failed:', error.message)
  }
}

// Get user by ID
export async function getUserById(id) {
  if (!id) return null
  
  const db = await getDatabase()
  const { ObjectId } = await import('mongodb')
  
  try {
    return await db.collection('users').findOne({ _id: new ObjectId(id) })
  } catch (error) {
    return null // Invalid ObjectId format
  }
}

// Soft delete user (mark as inactive instead of deleting)
export async function deactivateUser(email) {
  return await updateUser(email, { isActive: false, deactivatedAt: new Date() })
}

// Get user statistics
export async function getUserStats() {
  const db = await getDatabase()
  const users = db.collection('users')
  
  const [totalUsers, activeUsers, googleUsers, credentialUsers] = await Promise.all([
    users.countDocuments(),
    users.countDocuments({ isActive: true }),
    users.countDocuments({ provider: 'google' }),
    users.countDocuments({ provider: 'credentials' })
  ])
  
  return {
    total: totalUsers,
    active: activeUsers,
    googleUsers,
    credentialUsers
  }
}