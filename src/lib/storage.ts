// Simple file-based storage system for development
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json')
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDataDir()
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// Quote storage functions
export async function loadQuotes(): Promise<any[]> {
  return await readJsonFile(QUOTES_FILE, [] as any[])
}

export async function saveQuotes(quotes: any[]) {
  await writeJsonFile(QUOTES_FILE, quotes)
}

// Customer storage functions
export async function loadCustomers(): Promise<any[]> {
  return await readJsonFile(CUSTOMERS_FILE, [] as any[])
}

export async function saveCustomers(customers: any[]) {
  await writeJsonFile(CUSTOMERS_FILE, customers)
}

// Initialize storage files if they don't exist
export async function initializeStorage() {
  await ensureDataDir()
  
  // Create empty files if they don't exist
  try {
    await fs.access(QUOTES_FILE)
  } catch {
    await writeJsonFile(QUOTES_FILE, [])
  }
  
  try {
    await fs.access(CUSTOMERS_FILE)
  } catch {
    await writeJsonFile(CUSTOMERS_FILE, [])
  }
}
