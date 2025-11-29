// Production authentication with bcrypt password hashing
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from './config'
import { getCustomerByEmail, Customer } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  customerId: string
  email: string
  name: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.auth.bcryptRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate secure temporary password
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Customer authentication
export async function authenticateCustomer(email: string, password: string): Promise<Customer | null> {
  try {
    const customer = await getCustomerByEmail(email)
    if (!customer) return null
    
    const isValid = await verifyPassword(password, customer.password_hash)
    if (!isValid) return null
    
    return customer
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Session management (simple implementation)
export interface SessionData {
  customerId: string
  email: string
  name: string
  createdAt: number
}

const sessions = new Map<string, SessionData>()

export function createSession(customer: Customer): string {
  const sessionId = generateSecurePassword(32)
  const sessionData: SessionData = {
    customerId: customer.id,
    email: customer.email,
    name: `${customer.first_name} ${customer.last_name}`.trim(),
    createdAt: Date.now()
  }
  
  sessions.set(sessionId, sessionData)
  
  // Clean up expired sessions
  cleanupExpiredSessions()
  
  return sessionId
}

export function getSession(sessionId: string): SessionData | null {
  const session = sessions.get(sessionId)
  if (!session) return null
  
  // Check if session is expired
  const now = Date.now()
  const sessionAge = now - session.createdAt
  const maxAge = config.auth.sessionTimeout * 1000 // Convert to milliseconds
  
  if (sessionAge > maxAge) {
    sessions.delete(sessionId)
    return null
  }
  
  return session
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId)
}

function cleanupExpiredSessions(): void {
  const now = Date.now()
  const maxAge = config.auth.sessionTimeout * 1000
  
  for (const [sessionId, session] of sessions.entries()) {
    const sessionAge = now - session.createdAt
    if (sessionAge > maxAge) {
      sessions.delete(sessionId)
    }
  }
}

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)
