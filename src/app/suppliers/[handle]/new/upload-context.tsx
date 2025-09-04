'use client'

import * as React from 'react'

export type FileWithMetadata = {
  file: File
  fileObjectUrl: string
}

type UploadContextType = {
  files: FileWithMetadata[]
  addFiles: (newFiles: FileWithMetadata[]) => void
  removeFile: (fileIndex: number) => void
  clearFiles: () => void
}

const UploadContext = React.createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([])

  const addFiles = React.useCallback((newFiles: FileWithMetadata[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = React.useCallback((fileIndex: number) => {
    setFiles((prev) => {
      const fileToRemove = prev[fileIndex]
      URL.revokeObjectURL(fileToRemove.fileObjectUrl)
      return prev.filter((_, i) => i !== fileIndex)
    })
  }, [])

  const clearFiles = React.useCallback(() => {
    setFiles((prev) => {
      prev.forEach((file) => URL.revokeObjectURL(file.fileObjectUrl))
      return []
    })
  }, [])

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.fileObjectUrl))
    }
  }, [])

  const value = React.useMemo(
    () => ({
      files,
      addFiles,
      removeFile,
      clearFiles,
    }),
    [files, addFiles, removeFile, clearFiles]
  )

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export function useUploadContext() {
  const context = React.useContext(UploadContext)
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider')
  }
  return context
}
