'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, Download, FileText, Image, File, Folder, 
  X, Plus, Trash2, Eye, Share2, RefreshCw 
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

interface ProjectFileManagerProps {
  projectId: string
  projectName: string
  folderNumber?: string
  isOpen: boolean
  onClose: () => void
}

export default function ProjectFileManager({ 
  projectId, 
  projectName, 
  folderNumber,
  isOpen, 
  onClose 
}: ProjectFileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      loadFiles()
    }
  }, [isOpen, projectId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/files`)
      const data = await response.json()
      
      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/projects/${projectId}/upload`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadFiles() // Reload files
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(handleFileUpload)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(handleFileUpload)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card border border-cyber-mint/30 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-br from-cyber-mint/20 via-neon-purple/10 to-cosmic-blue/20 border-b border-cyber-mint/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-mint to-cosmic-blue rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-silver-glow">Project Files</CardTitle>
                <p className="text-silver-glow/70 text-sm">{projectName}</p>
                {folderNumber && (
                  <p className="text-cyber-mint text-xs font-mono">Folder: {folderNumber}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-silver-glow/70 hover:text-silver-glow"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
              dragOver 
                ? 'border-cyber-mint bg-cyber-mint/10' 
                : 'border-silver-glow/30 hover:border-cyber-mint/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-silver-glow/60" />
            <p className="text-silver-glow mb-2">
              Drag and drop files here, or{' '}
              <label className="text-cyber-mint cursor-pointer hover:underline">
                browse files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-silver-glow/60 text-sm">
              Upload files for this project. Clients will be able to access them.
            </p>
            {uploading && (
              <div className="mt-4">
                <div className="w-8 h-8 border-4 border-cyber-mint border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-cyber-mint mt-2">Uploading...</p>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-silver-glow">
                Files in Folder {folderNumber || 'Unknown'} ({files.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="border-cyber-mint/30"
                onClick={loadFiles}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
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
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {files.map((file) => (
                  <Card key={file.id} className="glass-card border border-cosmic-blue/20 hover:border-cyber-mint/40 transition-all">
                    <CardContent className="p-4">
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
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                              {file.uploaded_by_admin && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">Admin</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyber-mint/30"
                            onClick={() => window.open(file.download_url, '_blank')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </motion.div>
    </div>
  )
}
