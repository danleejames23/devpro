import { createMissingTables } from './check-database'

async function setupNotifications() {
  console.log('🔧 Setting up notification system...')
  
  try {
    const result = await createMissingTables()
    
    if (result.success) {
      console.log('✅ Notification system setup completed successfully!')
      console.log('📊 Database tables created:')
      console.log('   - notifications (stores all notifications)')
      console.log('   - notification_preferences (stores user preferences)')
      console.log('   - Performance indexes for faster queries')
    } else {
      console.error('❌ Setup failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Setup error:', error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupNotifications()
}

export { setupNotifications }
