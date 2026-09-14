import { supabase } from './supabase'

const BUCKET = 'restaurant-assets'

export async function uploadRestaurantAsset(folder: 'logo' | 'cover' | 'menu' | 'offers', file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('AUTH_REQUIRED')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
