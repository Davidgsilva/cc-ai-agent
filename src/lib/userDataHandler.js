import { getDatabase } from './db.js'
import { ObjectId } from 'mongodb'

// User conversation and interaction storage
export class UserDataHandler {
  constructor() {
    this.collections = {
      conversations: 'user_conversations',
      searches: 'user_searches', 
      interactions: 'user_interactions',
      preferences: 'user_preferences'
    }
  }

  // Get database instance
  async getDb() {
    return await getDatabase()
  }

  // Validate user ownership and privacy
  validateUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required')
    }
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format')
    }
    return new ObjectId(userId)
  }

  // ===================
  // CONVERSATION MANAGEMENT
  // ===================

  // Create a new conversation
  async createConversation(userId, metadata = {}) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)
    
    const conversation = {
      userId: validUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: metadata.title || 'New Conversation',
      provider: metadata.provider || 'openai',
      messageCount: 0,
      status: 'active',
      metadata: {
        ...metadata,
        userAgent: metadata.userAgent,
        clientIP: metadata.clientIP
      }
    }

    const result = await db.collection(this.collections.conversations).insertOne(conversation)
    return { ...conversation, _id: result.insertedId }
  }

  // Add message to conversation
  async addMessage(userId, conversationId, messageData) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)
    const validConversationId = new ObjectId(conversationId)

    // Verify conversation belongs to user
    const conversation = await db.collection(this.collections.conversations).findOne({
      _id: validConversationId,
      userId: validUserId
    })

    if (!conversation) {
      throw new Error('Conversation not found or access denied')
    }

    const message = {
      _id: new ObjectId(),
      conversationId: validConversationId,
      userId: validUserId,
      timestamp: new Date(),
      type: messageData.type, // 'user' | 'assistant' | 'system'
      content: messageData.content,
      metadata: {
        provider: messageData.provider,
        model: messageData.model,
        tokens: messageData.tokens,
        responseTime: messageData.responseTime,
        preferences: messageData.preferences
      }
    }

    // Insert message
    await db.collection(this.collections.interactions).insertOne(message)

    // Update conversation metadata
    await db.collection(this.collections.conversations).updateOne(
      { _id: validConversationId },
      { 
        $set: { 
          updatedAt: new Date(),
          title: messageData.title || conversation.title
        },
        $inc: { messageCount: 1 }
      }
    )

    return message
  }

  // Get user conversations with pagination
  async getUserConversations(userId, options = {}) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)
    
    const {
      limit = 20,
      offset = 0,
      sortBy = 'updatedAt',
      sortOrder = -1,
      status = 'active'
    } = options

    const conversations = await db.collection(this.collections.conversations)
      .find({ 
        userId: validUserId,
        ...(status && { status })
      })
      .sort({ [sortBy]: sortOrder })
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await db.collection(this.collections.conversations)
      .countDocuments({ userId: validUserId, status })

    return {
      conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  }

  // Get conversation messages
  async getConversationMessages(userId, conversationId, options = {}) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)
    const validConversationId = new ObjectId(conversationId)

    // Verify conversation belongs to user
    const conversation = await db.collection(this.collections.conversations).findOne({
      _id: validConversationId,
      userId: validUserId
    })

    if (!conversation) {
      throw new Error('Conversation not found or access denied')  
    }

    const {
      limit = 50,
      offset = 0,
      sortOrder = 1 // Chronological order
    } = options

    const messages = await db.collection(this.collections.interactions)
      .find({ 
        conversationId: validConversationId,
        userId: validUserId
      })
      .sort({ timestamp: sortOrder })
      .skip(offset)
      .limit(limit)
      .toArray()

    return {
      conversation,
      messages,
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit
      }
    }
  }

  // ===================
  // SEARCH HISTORY  
  // ===================

  // Save search query and results
  async saveSearch(userId, searchData) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const search = {
      userId: validUserId,
      timestamp: new Date(),
      query: searchData.query,
      domains: searchData.domains || [],
      results: searchData.results,
      cached: searchData.cached || false,
      responseTime: searchData.responseTime,
      metadata: {
        userAgent: searchData.userAgent,
        clientIP: searchData.clientIP,
        toolUsed: searchData.toolUsed
      }
    }

    const result = await db.collection(this.collections.searches).insertOne(search)
    return { ...search, _id: result.insertedId }
  }

  // Get user search history
  async getUserSearchHistory(userId, options = {}) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const {
      limit = 20,
      offset = 0,
      query = null // Search within search history
    } = options

    const filter = { 
      userId: validUserId,
      ...(query && { 
        $or: [
          { query: { $regex: query, $options: 'i' } },
          { 'results.summary': { $regex: query, $options: 'i' } }
        ]
      })
    }

    const searches = await db.collection(this.collections.searches)
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await db.collection(this.collections.searches)
      .countDocuments(filter)

    return {
      searches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  }

  // ===================
  // USER PREFERENCES
  // ===================

  // Save/update user preferences
  async updateUserPreferences(userId, preferences) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const result = await db.collection(this.collections.preferences).updateOne(
      { userId: validUserId },
      { 
        $set: {
          userId: validUserId,
          preferences,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return result
  }

  // Get user preferences
  async getUserPreferences(userId) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const userPrefs = await db.collection(this.collections.preferences)
      .findOne({ userId: validUserId })

    return userPrefs?.preferences || {}
  }

  // ===================
  // ANALYTICS & STATS
  // ===================

  // Get user activity summary
  async getUserStats(userId, timeframe = '7d') {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    // Calculate date range
    const now = new Date()
    const days = parseInt(timeframe.replace('d', ''))
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    const [conversationStats, searchStats, interactionStats] = await Promise.all([
      // Conversation stats
      db.collection(this.collections.conversations).aggregate([
        { $match: { userId: validUserId, createdAt: { $gte: startDate } } },
        { 
          $group: { 
            _id: null, 
            totalConversations: { $sum: 1 },
            totalMessages: { $sum: '$messageCount' },
            avgMessagesPerConversation: { $avg: '$messageCount' }
          }
        }
      ]).toArray(),

      // Search stats
      db.collection(this.collections.searches).aggregate([
        { $match: { userId: validUserId, timestamp: { $gte: startDate } } },
        { 
          $group: { 
            _id: null, 
            totalSearches: { $sum: 1 },
            uniqueQueries: { $addToSet: '$query' }
          }
        },
        { $addFields: { uniqueQueryCount: { $size: '$uniqueQueries' } } }
      ]).toArray(),

      // Recent activity
      db.collection(this.collections.interactions).aggregate([
        { $match: { userId: validUserId, timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            messageCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray()
    ])

    return {
      timeframe,
      conversations: conversationStats[0] || { totalConversations: 0, totalMessages: 0, avgMessagesPerConversation: 0 },
      searches: searchStats[0] || { totalSearches: 0, uniqueQueryCount: 0 },
      dailyActivity: interactionStats,
      generatedAt: new Date()
    }
  }

  // ===================
  // DATA MANAGEMENT
  // ===================

  // Delete user conversation
  async deleteConversation(userId, conversationId) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)
    const validConversationId = new ObjectId(conversationId)

    // Verify ownership
    const conversation = await db.collection(this.collections.conversations).findOne({
      _id: validConversationId,
      userId: validUserId
    })

    if (!conversation) {
      throw new Error('Conversation not found or access denied')
    }

    // Delete conversation and related messages
    await Promise.all([
      db.collection(this.collections.conversations).deleteOne({ _id: validConversationId }),
      db.collection(this.collections.interactions).deleteMany({ conversationId: validConversationId })
    ])

    return { success: true, deletedId: conversationId }
  }

  // Export user data (GDPR compliance)
  async exportUserData(userId) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const [conversations, searches, preferences, interactions] = await Promise.all([
      db.collection(this.collections.conversations).find({ userId: validUserId }).toArray(),
      db.collection(this.collections.searches).find({ userId: validUserId }).toArray(),
      db.collection(this.collections.preferences).find({ userId: validUserId }).toArray(),
      db.collection(this.collections.interactions).find({ userId: validUserId }).toArray()
    ])

    return {
      exportDate: new Date(),
      userId: userId,
      data: {
        conversations,
        searches,
        preferences,
        interactions
      }
    }
  }

  // Delete all user data (GDPR compliance)
  async deleteAllUserData(userId) {
    const db = await this.getDb()
    const validUserId = this.validateUserId(userId)

    const results = await Promise.all([
      db.collection(this.collections.conversations).deleteMany({ userId: validUserId }),
      db.collection(this.collections.searches).deleteMany({ userId: validUserId }),
      db.collection(this.collections.preferences).deleteMany({ userId: validUserId }),
      db.collection(this.collections.interactions).deleteMany({ userId: validUserId })
    ])

    return {
      success: true,
      deletedCounts: {
        conversations: results[0].deletedCount,
        searches: results[1].deletedCount,
        preferences: results[2].deletedCount,
        interactions: results[3].deletedCount
      }
    }
  }
}

// Export singleton instance
export const userDataHandler = new UserDataHandler()