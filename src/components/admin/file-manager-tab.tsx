'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, FolderOpen, File, FileText, FileImage, FileVideo, Music, 
  Code, Archive, Upload, Download, Search, Filter, MoreHorizontal, 
  Share2, Trash2, Edit, Eye, Copy, Link, Grid, List, Plus, Users,
  Calendar, HardDrive, Cloud, Lock, Unlock, Star, Tag
} from 'lucide-react'

interface AdminFile {
  id: string
  customer_id: string
  customer_name: string
  project_id?: string
  file_name: string
  file_size: number
  file_type: string
  folder_name: string
  description?: string
  uploaded_by_admin: boolean
  created_at: string
  download_count: number
  is_shared: boolean
  access_level: 'private' | 'client' | 'public'
  tags?: string[]
}

interface FileManagerTabProps {
  files: AdminFile[]
  onUploadFiles: (files: File[], metadata: any) => void
  onDeleteFile: (fileId: string) => void
  onShareFile: (fileId: string, accessLevel: string) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
}

export default function FileManagerTab({ 
  files, 
  onUploadFiles, 
  onDeleteFile, 
  onShareFile, 
  showSuccess, 
  showError 
}: FileManagerTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFolder, setFilterFolder] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterCustomer, setFilterCustomer] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState('/')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadMetadata, setUploadMetadata] = useState({
    customer_id: '',
    project_id: '',
    folder_name: '',
    description: '',
    access_level: 'client' as 'private' | 'client' | 'public'
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get unique folders, customers, and file types
  const folders = [...new Set(files.map(f => f.folder_name))].filter(Boolean)
  const customers = [...new Set(files.map(f => f.customer_name))].filter(Boolean)
  const fileTypes = [...new Set(files.map(f => f.file_type.split('/')[0]))].filter(Boolean)

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFolder = filterFolder === 'all' || file.folder_name === filterFolder
    const matchesType = filterType === 'all' || file.file_type.startsWith(filterType)
    const matchesCustomer = filterCustomer === 'all' || file.customer_name === filterCustomer
    
    return matchesSearch && matchesFolder && matchesType && matchesCustomer
  })

  // Group files by folder
  const filesByFolder = filteredFiles.reduce((acc, file) => {
    const folder = file.folder_name || 'Root'
    if (!acc[folder]) {
      acc[folder] = []
    }
    acc[folder].push(file)
    return acc
  }, {} as Record<string, AdminFile[]>)

  const getFileIcon = (fileType: string, fileName: string) => {
    const type = fileType.split('/')[0]
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (type) {
      case 'image': return <FileImage className="w-8 h-8 text-blue-500" />
      case 'video': return <FileVideo className="w-8 h-8 text-purple-500" />
      case 'audio': return <Music className="w-8 h-8 text-green-500" />
      case 'application':
        if (extension === 'pdf') return <FileText className="w-8 h-8 text-red-500" />
        if (['zip', 'rar', '7z'].includes(extension || '')) return <Archive className="w-8 h-8 text-orange-500" />
        if (['js', 'ts', 'html', 'css', 'json'].includes(extension || '')) return <Code className="w-8 h-8 text-indigo-500" />
        return <File className="w-8 h-8 text-gray-500" />
      default: return <File className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-500 text-white'
      case 'client': return 'bg-blue-500 text-white'
      case 'private': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setIsUploadModalOpen(true)
    }
  }

  const handleUploadSubmit = async () => {
    try {
      const files = Array.from(fileInputRef.current?.files || [])
      if (files.length === 0) {
        showError('No Files', 'Please select files to upload')
        return
      }

      if (!uploadMetadata.customer_id) {
        showError('Validation Error', 'Please select a customer')
        return
      }

      await onUploadFiles(files, uploadMetadata)
      
      setIsUploadModalOpen(false)
      setUploadMetadata({
        customer_id: '',
        project_id: '',
        folder_name: '',
        description: '',
        access_level: 'client'
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      showSuccess('Upload Complete', `${files.length} file(s) uploaded successfully`)
    } catch (error) {
      showError('Upload Failed', 'Failed to upload files')
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await onDeleteFile(fileId)
      showSuccess('File Deleted', 'File deleted successfully')
    } catch (error) {
      showError('Delete Failed', 'Failed to delete file')
    }
  }

  const handleShareFile = async (fileId: string, accessLevel: string) => {
    try {
      await onShareFile(fileId, accessLevel)
      showSuccess('Sharing Updated', 'File sharing settings updated')
    } catch (error) {
      showError('Update Failed', 'Failed to update sharing settings')
    }
  }

  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.file_size, 0),
    sharedFiles: files.filter(f => f.is_shared).length,
    privateFiles: files.filter(f => f.access_level === 'private').length,
    recentUploads: files.filter(f => new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatFileSize(stats.totalSize)}</div>
            <div className="text-sm text-muted-foreground">Storage Used</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sharedFiles}</div>
            <div className="text-sm text-muted-foreground">Shared</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.privateFiles}</div>
            <div className="text-sm text-muted-foreground">Private</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.recentUploads}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search files, customers, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Types</option>
                {fileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Customers</option>
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Browser */}
      <div className="space-y-6">
        {Object.entries(filesByFolder).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No files found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterFolder !== 'all' || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first files to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(filesByFolder).map(([folderName, folderFiles]) => (
            <Card key={folderName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  {folderName}
                  <Badge variant="secondary">{folderFiles.length} files</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {folderFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                          <CardContent className="p-4 text-center">
                            <div className="mb-3">
                              {getFileIcon(file.file_type, file.file_name)}
                            </div>
                            
                            <h4 className="font-medium text-sm truncate mb-2" title={file.file_name}>
                              {file.file_name}
                            </h4>
                            
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>{formatFileSize(file.file_size)}</p>
                              <p>{file.customer_name}</p>
                              <p>{new Date(file.created_at).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="flex items-center justify-center gap-1 mt-3">
                              <Badge className={getAccessLevelColor(file.access_level)}>
                                {file.access_level}
                              </Badge>
                              {file.uploaded_by_admin && (
                                <Badge variant="outline">Admin</Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folderFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.file_type, file.file_name)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{file.file_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>{file.customer_name}</span>
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                              {file.download_count > 0 && (
                                <span>{file.download_count} downloads</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getAccessLevelColor(file.access_level)}>
                              {file.access_level}
                            </Badge>
                            {file.uploaded_by_admin && (
                              <Badge variant="outline">Admin</Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Configure file upload settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer ID *</label>
                <Input
                  value={uploadMetadata.customer_id}
                  onChange={(e) => setUploadMetadata(prev => ({ ...prev, customer_id: e.target.value }))}
                  placeholder="Enter customer ID"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Project ID (Optional)</label>
                <Input
                  value={uploadMetadata.project_id}
                  onChange={(e) => setUploadMetadata(prev => ({ ...prev, project_id: e.target.value }))}
                  placeholder="Enter project ID"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Folder Name</label>
                <Input
                  value={uploadMetadata.folder_name}
                  onChange={(e) => setUploadMetadata(prev => ({ ...prev, folder_name: e.target.value }))}
                  placeholder="e.g., Project Files, Deliverables"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Access Level</label>
                <select
                  value={uploadMetadata.access_level}
                  onChange={(e) => setUploadMetadata(prev => ({ ...prev, access_level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="private">Private (Admin only)</option>
                  <option value="client">Client Access</option>
                  <option value="public">Public</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={uploadMetadata.description}
                  onChange={(e) => setUploadMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe these files..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUploadSubmit} className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
