import { NextRequest, NextResponse } from 'next/server'
import { 
  getProjectFilesByCustomerId, 
  getFileStats, 
  getGitHubRepositoriesByCustomerId 
} from '@/lib/database'

// GET /api/files - Get file data for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const projectId = searchParams.get('projectId')
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const [stats, files, repos] = await Promise.all([
      getFileStats(customerId),
      getProjectFilesByCustomerId(customerId, projectId || undefined),
      getGitHubRepositoriesByCustomerId(customerId)
    ])

    // Separate files and folders
    const folders = files.filter(item => item.type === 'folder')
    const fileItems = files.filter(item => item.type === 'file')

    // Transform the data to match the expected format
    const transformedStats = {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      sharedFiles: stats.sharedFiles,
      githubRepos: repos.length
    }

    const transformedFiles = fileItems.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      mimeType: file.mime_type,
      customerId: file.customer_id,
      projectId: file.project_id,
      isShared: file.is_shared,
      uploadedAt: file.uploaded_at,
      modifiedAt: file.modified_at,
      downloadUrl: file.download_url,
      thumbnailUrl: file.thumbnail_url
    }))

    const transformedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      type: folder.type,
      size: folder.size,
      customerId: folder.customer_id,
      projectId: folder.project_id,
      fileCount: 0, // Would need to calculate this separately
      uploadedAt: folder.uploaded_at,
      modifiedAt: folder.modified_at
    }))

    const transformedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      customerId: repo.customer_id,
      projectId: repo.project_id,
      githubUrl: repo.github_url,
      status: repo.status,
      lastCommitDate: repo.last_commit_date,
      commitCount: repo.commit_count,
      isPrivate: repo.is_private,
      description: repo.description,
      created_at: repo.created_at,
      updated_at: repo.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: transformedStats,
        files: transformedFiles,
        folders: transformedFolders,
        repos: transformedRepos
      }
    })

  } catch (error) {
    console.error('Error fetching file data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
