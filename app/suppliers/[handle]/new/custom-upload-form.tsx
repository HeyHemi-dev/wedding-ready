'use client'

import * as React from 'react'
import { generateClientDropzoneAccept, generatePermittedFileTypes } from 'uploadthing/client'

import { useUploadThing, useDropzone } from '@/utils/uploadthing'

interface FileWithPreview extends File {
  preview?: string
}

export function CustomUploadForm() {
  const [files, setFiles] = React.useState<FileWithPreview[]>([])

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    )
  }, [])

  const { startUpload, routeConfig } = useUploadThing('tileUploader', {
    onClientUploadComplete: () => {
      alert('uploaded successfully!')
    },
    onUploadError: () => {
      alert('error occurred while uploading')
    },
    onUploadBegin: (filename) => {
      console.log('upload has begun for', filename)
    },
  })

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(generatePermittedFileTypes(routeConfig).fileTypes),
  })

  // Cleanup previews
  React.useEffect(() => {
    return () =>
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
  }, [files])

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-gray-300 rounded-md p-4">
        <input {...getInputProps()} />
        <p className="text-center text-gray-600">Drop images here or click to select files</p>
      </div>

      {files.length > 0 && (
        <div>
          <button onClick={() => startUpload(files)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upload {files.length} files
          </button>

          <div className="grid grid-cols-4 gap-4">
            {files.map((file) => (
              <FilePreview key={file.name} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FilePreview({ file }: { file: FileWithPreview }) {
  return (
    <div className="relative aspect-square">
      <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded-lg" />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate rounded-b-lg">{file.name}</div>
    </div>
  )
}
