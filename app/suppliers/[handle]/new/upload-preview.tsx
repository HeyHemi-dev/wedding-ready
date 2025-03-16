import { Card, CardContent } from '@/components/ui/card'
import { Supplier, UserWithDetail } from '@/models/types'
import { FileWithMetadata } from './upload-dropzone'
import { UploadPreviewForm } from './upload-preview-form'
import { Separator } from '@/components/ui/separator'

export function UploadPreviewList({
  files,
  supplier,
  user,
  onCompleteAction,
}: {
  files: FileWithMetadata[]
  supplier: Supplier
  user: UserWithDetail
  onCompleteAction: (fileIndex: number) => void
}) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-6">
        {files.map((file, index) => (
          <>
            <UploadPreview key={file.fileObjectUrl} file={file} supplier={supplier} user={user} onCompleteAction={() => onCompleteAction(index)} />
            <Separator />
          </>
        ))}
      </div>
    </>
  )
}

export function UploadPreview({
  file,
  supplier,
  user,
  onCompleteAction,
}: {
  file: FileWithMetadata
  supplier: Supplier
  user: UserWithDetail
  onCompleteAction: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_3fr] gap-6">
      <div className="aspect-square">
        <img src={file.fileObjectUrl} alt={file.file.name} className="object-contain rounded-lg" />
      </div>

      <UploadPreviewForm file={file} supplier={supplier} user={user} onCompleteAction={onCompleteAction} />
    </div>
  )
}
