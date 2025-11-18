'use client'

import * as React from 'react'

import { Supplier } from '@/app/_types/suppliers'

export type UploadItem = {
  uploadId: string
  file: File
  fileObjectUrl: string
}

type UploadContextType = {
  files: UploadItem[]
  addFiles: (files: File[]) => void
  removeFile: (uploadId: string) => void
  clearFiles: () => void
  supplier: Supplier
  authUserId: string
}

const UploadContext = React.createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children, supplier, authUserId }: { children: React.ReactNode; supplier: Supplier; authUserId: string }) {
  const [files, setFiles] = React.useState<UploadItem[]>([])

  const addFiles = React.useCallback((files: File[]) => {
    const uploadItem: UploadItem[] = files.map((file) => ({
      uploadId: crypto.randomUUID(),
      file,
      fileObjectUrl: URL.createObjectURL(file),
    }))
    setFiles((prev) => [...prev, ...uploadItem])
  }, [])

  const removeFile = React.useCallback((uploadId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((file) => file.uploadId === uploadId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.fileObjectUrl)
      }
      return prev.filter((file) => file.uploadId !== uploadId)
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
      supplier,
      authUserId,
    }),
    [files, addFiles, removeFile, clearFiles, supplier, authUserId]
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
