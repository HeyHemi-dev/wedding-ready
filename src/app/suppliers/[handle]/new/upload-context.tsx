'use client'

import * as React from 'react'

import { Supplier } from '@/app/_types/suppliers'

export type UploadItem = {
  uploadId: string
  file: File
  fileObjectUrl: string
  ratio: number
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
    Promise.all(
      files.map(async (file) => {
        const fileObjectUrl = URL.createObjectURL(file)
        return {
          uploadId: crypto.randomUUID(),
          file,
          fileObjectUrl,
          ratio: await getImageRatio(fileObjectUrl),
        }
      })
    ).then((uploadItems) => {
      setFiles((prev) => [...prev, ...uploadItems])
    })
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

/**
 * Returns the width as a ratio of height = 1. For example, if the width is 200 and the height is 100, the ratio is 2.
 * @param file
 * @returns
 */
function getImageRatio(fileObjectUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const { width, height } = img
      const ratio = width / height
      URL.revokeObjectURL(img.src)
      resolve(ratio)
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(img.src)
      reject(err)
    }

    img.src = fileObjectUrl
  })
}
