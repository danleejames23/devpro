// Using standard Request/Response instead of Next.js types
import { createProjectFile, getProjectFilesByCustomerId } from '@/lib/database'

// POST /api/files/folder - Create new folder
export async function POST(request: Request) {
  try {
    const { name, customerId } = await request.json()

    if (!name || !customerId) {
      return Response.json(
        { success: false, error: 'Folder name and customer ID are required' },
        { status: 400 }
      )
    }

    // Check if folder name already exists for this customer
    const existingFiles = await getProjectFilesByCustomerId(customerId)
    const existingFolder = existingFiles.find(item => 
      item.type === 'folder' && 
      item.name.toLowerCase() === name.toLowerCase() && 
      item.customer_id === customerId
    )

    if (existingFolder) {
      return Response.json(
        { success: false, error: 'A folder with this name already exists' },
        { status: 409 }
      )
    }

    // Create new folder in database
    const newFolder = await createProjectFile({
      customer_id: customerId,
      name: name.trim(),
      type: 'folder',
      size: 0,
      is_shared: false
    })

    return Response.json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        id: newFolder.id,
        name: newFolder.name,
        type: newFolder.type,
        size: newFolder.size,
        customerId: newFolder.customer_id,
        fileCount: 0,
        uploadedAt: newFolder.uploaded_at,
        modifiedAt: newFolder.modified_at
      }
    })

  } catch (error) {
    console.error('Error creating folder:', error)
    return Response.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}
