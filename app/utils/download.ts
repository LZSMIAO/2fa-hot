export function downloadFile(data: Blob | string, filename: string) {
  const objectUrl = typeof data !== 'string'
  const url = objectUrl ? URL.createObjectURL(data) : data
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  if (objectUrl) setTimeout(() => URL.revokeObjectURL(url), 1000)
}
