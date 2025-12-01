'use client'

import * as React from 'react'

import { useUploadContext } from './upload-context'
import { UploadDropzone } from './upload-dropzone'
import { UploadPreviewList } from './upload-preview'

export function UploadLayout() {
  const { files } = useUploadContext()

  // Warn user before leaving if there are files (form data or uploads in progress)
  React.useEffect(() => {
    if (files.length === 0) {
      return
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      // Modern browsers ignore custom messages and show their own
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [files.length])

  return <>{files.length > 0 ? <UploadPreviewList /> : <UploadDropzone />}</>
}
