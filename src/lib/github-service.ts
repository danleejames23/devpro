// GitHub API integration service
import { getDatabase } from './database'

export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  access_token?: string
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

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  html_url: string
}

class GitHubService {
  private baseUrl = 'https://api.github.com'

  // Store GitHub access token for a customer
  async storeGitHubToken(customerId: string, accessToken: string, githubUser: GitHubUser): Promise<void> {
    const client = await getDatabase()
    
    try {
      await client.query(
        `INSERT INTO github_integrations (customer_id, github_user_id, github_username, access_token, github_data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (customer_id) 
         DO UPDATE SET 
           github_user_id = $2,
           github_username = $3,
           access_token = $4,
           github_data = $5,
           updated_at = CURRENT_TIMESTAMP`,
        [customerId, githubUser.id, githubUser.login, accessToken, JSON.stringify(githubUser)]
      )
    } finally {
      client.release()
    }
  }

  // Get GitHub access token for a customer
  async getGitHubToken(customerId: string): Promise<string | null> {
    const client = await getDatabase()
    
    try {
      const result = await client.query(
        'SELECT access_token FROM github_integrations WHERE customer_id = $1',
        [customerId]
      )
      
      return result.rows[0]?.access_token || null
    } finally {
      client.release()
    }
  }

  // Check if customer has GitHub connected
  async isGitHubConnected(customerId: string): Promise<boolean> {
    const token = await this.getGitHubToken(customerId)
    return !!token
  }

  // Make authenticated GitHub API request
  private async makeGitHubRequest(endpoint: string, accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FreelanceWebsite/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get user's GitHub repositories
  async getUserRepositories(customerId: string): Promise<GitHubRepository[]> {
    const accessToken = await this.getGitHubToken(customerId)
    if (!accessToken) {
      throw new Error('GitHub not connected')
    }

    const repos = await this.makeGitHubRequest('/user/repos?sort=updated&per_page=100', accessToken)
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      size: repo.size,
      language: repo.language,
      topics: repo.topics || []
    }))
  }

  // Get repository contents
  async getRepositoryContents(customerId: string, owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
    const accessToken = await this.getGitHubToken(customerId)
    if (!accessToken) {
      throw new Error('GitHub not connected')
    }

    const endpoint = `/repos/${owner}/${repo}/contents/${path}`
    const contents = await this.makeGitHubRequest(endpoint, accessToken)
    
    // Handle single file response
    if (!Array.isArray(contents)) {
      return [contents]
    }

    return contents.map((item: any) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      url: item.url,
      html_url: item.html_url,
      git_url: item.git_url,
      download_url: item.download_url,
      type: item.type,
      content: item.content,
      encoding: item.encoding
    }))
  }

  // Get file content
  async getFileContent(customerId: string, owner: string, repo: string, path: string): Promise<GitHubFile> {
    const accessToken = await this.getGitHubToken(customerId)
    if (!accessToken) {
      throw new Error('GitHub not connected')
    }

    const endpoint = `/repos/${owner}/${repo}/contents/${path}`
    const file = await this.makeGitHubRequest(endpoint, accessToken)
    
    return {
      name: file.name,
      path: file.path,
      sha: file.sha,
      size: file.size,
      url: file.url,
      html_url: file.html_url,
      git_url: file.git_url,
      download_url: file.download_url,
      type: file.type,
      content: file.content,
      encoding: file.encoding
    }
  }

  // Get repository commits
  async getRepositoryCommits(customerId: string, owner: string, repo: string, limit: number = 10): Promise<GitHubCommit[]> {
    const accessToken = await this.getGitHubToken(customerId)
    if (!accessToken) {
      throw new Error('GitHub not connected')
    }

    const endpoint = `/repos/${owner}/${repo}/commits?per_page=${limit}`
    const commits = await this.makeGitHubRequest(endpoint, accessToken)
    
    return commits.map((commit: any) => ({
      sha: commit.sha,
      commit: {
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        message: commit.commit.message
      },
      html_url: commit.html_url
    }))
  }

  // Get GitHub user info
  async getGitHubUser(customerId: string): Promise<GitHubUser | null> {
    const client = await getDatabase()
    
    try {
      const result = await client.query(
        'SELECT github_data FROM github_integrations WHERE customer_id = $1',
        [customerId]
      )
      
      if (result.rows[0]?.github_data) {
        return JSON.parse(result.rows[0].github_data)
      }
      
      return null
    } finally {
      client.release()
    }
  }

  // Disconnect GitHub
  async disconnectGitHub(customerId: string): Promise<void> {
    const client = await getDatabase()
    
    try {
      await client.query(
        'DELETE FROM github_integrations WHERE customer_id = $1',
        [customerId]
      )
    } finally {
      client.release()
    }
  }
}

export const githubService = new GitHubService()
