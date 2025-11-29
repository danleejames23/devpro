'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, GitBranch, Star, Eye, Lock, Unlock, Calendar, Code, Folder, FileText, ExternalLink } from 'lucide-react'
import { 
  getGitHubStatus, 
  connectGitHub, 
  disconnectGitHub, 
  getGitHubRepositories,
  getRepositoryContents,
  GitHubStatus, 
  GitHubRepository, 
  GitHubFile 
} from '@/lib/files-client'

interface GitHubIntegrationProps {
  customerId: string
}

export function GitHubIntegration({ customerId }: GitHubIntegrationProps) {
  const [status, setStatus] = useState<GitHubStatus | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [repoContents, setRepoContents] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [loadingContents, setLoadingContents] = useState(false)

  useEffect(() => {
    loadGitHubStatus()
  }, [customerId])

  useEffect(() => {
    if (status?.connected) {
      loadRepositories()
    }
  }, [status])

  const loadGitHubStatus = async () => {
    try {
      const githubStatus = await getGitHubStatus(customerId)
      setStatus(githubStatus)
    } catch (error) {
      console.error('Error loading GitHub status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRepositories = async () => {
    setLoadingRepos(true)
    try {
      const repos = await getGitHubRepositories(customerId)
      setRepositories(repos)
    } catch (error) {
      console.error('Error loading repositories:', error)
    } finally {
      setLoadingRepos(false)
    }
  }

  const loadRepositoryContents = async (repo: GitHubRepository, path: string = '') => {
    setLoadingContents(true)
    try {
      const [owner, repoName] = repo.full_name.split('/')
      const contents = await getRepositoryContents(customerId, owner, repoName, path)
      setRepoContents(contents)
      setCurrentPath(path)
    } catch (error) {
      console.error('Error loading repository contents:', error)
    } finally {
      setLoadingContents(false)
    }
  }

  const handleConnectGitHub = () => {
    connectGitHub(customerId)
  }

  const handleDisconnectGitHub = async () => {
    const success = await disconnectGitHub(customerId)
    if (success) {
      setStatus({ connected: false, user: null })
      setRepositories([])
      setSelectedRepo(null)
      setRepoContents([])
    }
  }

  const handleSelectRepository = (repo: GitHubRepository) => {
    setSelectedRepo(repo)
    loadRepositoryContents(repo)
  }

  const handleNavigateToFolder = (file: GitHubFile) => {
    if (file.type === 'dir' && selectedRepo) {
      loadRepositoryContents(selectedRepo, file.path)
    }
  }

  const handleNavigateUp = () => {
    if (currentPath && selectedRepo) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/')
      loadRepositoryContents(selectedRepo, parentPath)
    }
  }

  const getFileIcon = (file: GitHubFile) => {
    if (file.type === 'dir') return <Folder className="h-4 w-4 text-blue-500" />
    
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs'].includes(ext || '')) {
      return <Code className="h-4 w-4 text-green-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to access your repositories and project files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect GitHub</h3>
            <p className="text-muted-foreground mb-6">
              Access your repositories, browse files, and manage your projects directly from your dashboard.
            </p>
            <Button onClick={handleConnectGitHub} className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Connect GitHub Account
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* GitHub User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Connected as {status.user?.name || status.user?.login}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status.user?.avatar_url && (
                <img 
                  src={status.user.avatar_url} 
                  alt={status.user.login}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{status.user?.name || status.user?.login}</p>
                <p className="text-sm text-muted-foreground">@{status.user?.login}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnectGitHub}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repositories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Your Repositories
          </CardTitle>
          <CardDescription>
            {repositories.length} repositories found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRepos ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : repositories.length > 0 ? (
            <div className="space-y-3">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedRepo?.id === repo.id ? 'bg-accent border-primary' : ''
                  }`}
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{repo.name}</h3>
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Unlock className="h-4 w-4 text-gray-500" />
                        )}
                        {repo.language && (
                          <Badge variant="secondary" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated {formatDate(repo.updated_at)}
                        </span>
                        <span>{formatFileSize(repo.size * 1024)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(repo.html_url, '_blank')
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No repositories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repository Contents */}
      {selectedRepo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              {selectedRepo.name} - Files
            </CardTitle>
            <CardDescription>
              {currentPath ? `/${currentPath}` : 'Root directory'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingContents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {currentPath && (
                  <div
                    className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={handleNavigateUp}
                  >
                    <Folder className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">..</span>
                  </div>
                )}
                {repoContents.map((file) => (
                  <div
                    key={file.sha}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-accent ${
                      file.type === 'dir' ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => file.type === 'dir' && handleNavigateToFolder(file)}
                  >
                    {getFileIcon(file)}
                    <span className="flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.type === 'file' && formatFileSize(file.size)}
                    </span>
                    {file.download_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.html_url, '_blank')
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {repoContents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">This directory is empty</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
