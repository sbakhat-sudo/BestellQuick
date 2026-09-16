import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fileToBase64 } from '@/lib/toBase64'

export interface ParsedMenuItem {
  name: string
  description?: string
  price: number
  category: string
}

export function useParseMenuImage() {
  return useMutation({
    mutationFn: async (files: File[]): Promise<ParsedMenuItem[]> => {
      const images = await Promise.all(files.map(fileToBase64))
      const { data, error } = await supabase.functions.invoke<{ items?: ParsedMenuItem[]; error?: string }>('parse-menu-image', {
        body: { images },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data?.items ?? []
    },
  })
}
