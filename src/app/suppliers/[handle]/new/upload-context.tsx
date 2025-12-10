'use client'

import * as React from 'react'

import { Supplier } from '@/app/_types/suppliers'
import { tryCatch } from '@/utils/try-catch'
import { toast } from 'sonner'

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
    ;(async () => {
      const { data: uploadItems, error } = await tryCatch(
        Promise.all(
          files.map(async (file) => ({
            uploadId: crypto.randomUUID(),
            file,
            fileObjectUrl: URL.createObjectURL(file),
            ratio: await getImageRatio(file),
          }))
        )
      )
      if (error) {
        toast.error('Error adding files')
        return
      }
      setFiles((prev) => [...prev, ...uploadItems])
    })()
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
 * Returns the height as a ratio of width = 1. For example, if the width is 100 and the height is 200, the ratio is 0.5.
 * @param file
 * @returns
 */
function getImageRatio(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const { width, height } = img
      const ratio = Math.round((width / height) * 1000) / 1000
      URL.revokeObjectURL(img.src)
      resolve(ratio)
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(img.src)
      reject(err)
    }

    img.src = URL.createObjectURL(file)
  })
}
