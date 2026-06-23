import type { UploadValue } from "@/components/hr/add-staff/step2-documents-upload"

/** First newly uploaded file — used as profile_image on save. */
export function primaryStaffPhotoFile(photos: UploadValue[]): File | undefined {
  return photos.find((p) => p.file instanceof File)?.file
}

export function newStaffPhotoFiles(photos: UploadValue[]): File[] {
  return photos.map((p) => p.file).filter((f): f is File => f instanceof File)
}

/**
 * Merge newly accepted uploads. New files replace server-only previews (edit mode)
 * so profile_image always maps to the latest upload.
 */
export function mergeStaffPhotos(prev: UploadValue[], accepted: UploadValue[], max = 5): UploadValue[] {
  if (accepted.length === 0) return prev.slice(0, max)

  for (const p of prev) {
    if (p.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl)
  }

  const keptFiles = prev.filter((p) => p.file instanceof File)
  return [...accepted, ...keptFiles].slice(0, max)
}
