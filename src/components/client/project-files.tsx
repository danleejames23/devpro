'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, FileText, Image, File, Folder, 
  Calendar, User, Eye 
} from 'lucide-react'

interface ProjectFile {
  id: string
  name: string
  original_name: string
  path: string
  size: number
  type: string
  uploaded_by_admin: boolean
  created_at: string
  download_url: string
}

interface ProjectFilesProps {
  projectId: string
  projectName: string
}

export default function ProjectFiles({ projectId, projectName }: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  useEffect(() => {
    if (projectId) {
      loadFiles()
    }
  }, [projectId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading files for project:', projectId)
      const response = await fetch(`/api/projects/${projectId}/files`)
      const data = await response.json()
      
      console.log('📁 Files API response:', data)
      
      if (data.success) {
        setFiles(data.files || [])
        console.log('✅ Files loaded:', data.files?.length || 0)
      } else {
        console.error('❌ Files API error:', data.error)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', fileToUpload)
      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: 'POST',
        body: formData
      })
      const result = await res.json().catch(() => ({ success: false }))
      if (res.ok && result.success) {
        setFileToUpload(null)
        await loadFiles()
      }
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const handleDownload = (file: ProjectFile) => {
    window.open(file.download_url, '_blank')
  }

  return (
    <Card className="glass-card border border-cosmic-blue/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cosmic-blue to-cyber-mint rounded-lg flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-silver-glow">Project Files</CardTitle>
            <p className="text-silver-glow/70 text-sm">{projectName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="file"
            onChange={(e) => setFileToUpload(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            className="block w-full text-sm"
          />
          <Button size="sm" variant="outline" onClick={handleUpload} disabled={!fileToUpload || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-cyber-mint border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-silver-glow/60">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-silver-glow/60">
            <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No files available yet</p>
            <p className="text-sm mt-2">Files shared by your project team will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-silver-glow/70 text-sm">
                {files.length} file{files.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="grid gap-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-cosmic-blue/20 hover:border-cyber-mint/40 transition-all p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cosmic-blue to-cyber-mint rounded-lg flex items-center justify-center text-white">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-silver-glow">{file.original_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-silver-glow/60">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          {file.uploaded_by_admin && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                <User className="w-3 h-3 mr-1" />
                                Team
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyber-mint/30 hover:bg-cyber-mint/10"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
