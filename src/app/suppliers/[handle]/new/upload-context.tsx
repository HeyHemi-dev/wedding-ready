'use client'

import * as React from 'react'

export type FileWithMetadata = {
  file: File
  fileObjectUrl: string
}

type UploadContextType = {
  files: FileWithMetadata[]
  addFiles: (files: File[]) => void
  removeFile: (fileIndex: number) => void
  clearFiles: () => void
}

const UploadContext = React.createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([])

  const addFiles = React.useCallback((files: File[]) => {
    const filesWithMetadata: FileWithMetadata[] = files.map((file) => ({
      file,
      fileObjectUrl: URL.createObjectURL(file),
    }))
    setFiles((prev) => [...prev, ...filesWithMetadata])
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

  // Cleanup object URLs on unmount only
  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.fileObjectUrl))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
