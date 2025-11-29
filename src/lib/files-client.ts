// Client-side file management interfaces and utilities
// Note: All file operations moved to API routes to avoid client-side fs usage

export interface ProjectFile {
  id: string
  name: string
  type: 'folder' | 'file'
  size: number
  mimeType?: string
  customerId: string
  projectId: string
  parentId?: string
  isShared: boolean
  uploadedAt: string
  modifiedAt: string
  downloadUrl?: string
  thumbnailUrl?: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  updated_at: string
  size: number
  language: string | null
  topics: string[]
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  content?: string
  encoding?: string
}

export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
}

export interface GitHubStatus {
  connected: boolean
  user: GitHubUser | null
}

export interface FileStats {
  totalFiles: number
  totalSize: number
  sharedFiles: number
  githubRepos: number
}

// Client-side API functions
export async function getFilesData(customerId: string, projectId?: string): Promise<{
  stats: FileStats
  files: ProjectFile[]
  repos: GitHubRepository[]
} | null> {
  try {
    const url = projectId 
      ? `/api/files?customerId=${customerId}&projectId=${projectId}`
      : `/api/files?customerId=${customerId}`
    
    const response = await fetch(url)
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error fetching files data:', error)
    return null
  }
}

export async function createFolder(customerId: string, folderData: {
  name: string
  projectId: string
  parentId?: string
}): Promise<ProjectFile | null> {
  try {
    const response = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'folder', 
        customerId, 
        ...folderData 
      })
    })
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error creating folder:', error)
    return null
  }
}

export async function uploadFile(customerId: string, fileData: {
  name: string
  size: number
  mimeType: string
  projectId: string
  parentId?: string
}): Promise<ProjectFile | null> {
  try {
    const response = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'file', 
        customerId, 
        ...fileData 
      })
    })
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

// GitHub API functions
export async function getGitHubStatus(customerId: string): Promise<GitHubStatus | null> {
  try {
    const response = await fetch(`/api/github/status?customerId=${customerId}`)
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : null
    }
    return null
  } catch (error) {
    console.error('Error fetching GitHub status:', error)
    return null
  }
}

export async function connectGitHub(customerId: string): Promise<void> {
  window.location.href = `/api/github/auth?customerId=${customerId}`
}

export async function disconnectGitHub(customerId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/github/status?customerId=${customerId}`, {
      method: 'DELETE'
    })
    return response.ok
  } catch (error) {
    console.error('Error disconnecting GitHub:', error)
    return false
  }
}

export async function getGitHubRepositories(customerId: string): Promise<GitHubRepository[]> {
  try {
    const response = await fetch(`/api/github/repositories?customerId=${customerId}`)
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : []
    }
    return []
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return []
  }
}

export async function getRepositoryContents(customerId: string, owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
  try {
    const response = await fetch(`/api/github/contents?customerId=${customerId}&owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`)
    if (response.ok) {
      const result = await response.json()
      return result.success ? result.data : []
    }
    return []
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    return []
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(mimeType?: string): string {
  if (!mimeType) return 'file'
  
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive'
  if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('typescript')) return 'code'
  
  return 'file'
}
