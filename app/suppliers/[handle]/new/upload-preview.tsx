import { SupplierRaw, User } from '@/models/types'
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
  supplier: SupplierRaw
  user: User
  onCompleteAction: (fileIndex: number) => void
}) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-6">
        {files.map((file, index) => (
          <>
            <UploadPreviewForm key={file.fileObjectUrl} file={file} supplier={supplier} user={user} onCompleteAction={() => onCompleteAction(index)} />
            <Separator />
          </>
        ))}
      </div>
    </>
  )
}
