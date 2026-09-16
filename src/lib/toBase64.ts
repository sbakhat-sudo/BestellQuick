export async function fileToBase64(file: File): Promise<{ data: string; media_type: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  const [, data] = dataUrl.split(',')
  return { data, media_type: file.type }
}
