// Utility functions for updating live stats

export function incrementProjectCount() {
  // Dispatch custom event to update live stats
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectCompleted'))
  }
}

export function incrementClientCount() {
  // Dispatch custom event to update live stats
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newClient'))
  }
}

export function updateRevenueStats(amount: number) {
  // This could be used to update revenue stats in the future
  // For now, we'll handle this manually in the homepage stats
  console.log('Revenue updated:', amount)
}
