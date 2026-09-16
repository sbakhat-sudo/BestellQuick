// Supabase Edge Function: parse-menu-image
//
// Called from the dashboard's Menu page ("Importer avec l'IA"). Takes one or
// more photos of a physical menu, sends them to Claude for vision-based
// extraction, and returns a structured list of menu items (name,
// description, price, category) for the owner to review before import.
// Nothing is written to the database here — item creation happens
// client-side via the normal menu_items insert path once the owner confirms.
//
// Required secrets (set with `supabase secrets set`):
//   ANTHROPIC_API_KEY
import Anthropic from 'npm:@anthropic-ai/sdk@0.32'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '' })

const MAX_IMAGES = 6
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

interface IncomingImage {
  data: string
  media_type: string
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'extract_menu_items',
  description: 'Record the dishes found on the menu photo(s).',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Dish name, in the language it appears on the menu' },
            description: { type: 'string', description: 'Short description if present on the menu, otherwise an empty string' },
            price: { type: 'number', description: 'Numeric price only, no currency symbol' },
            category: { type: 'string', description: 'Section/category the dish appears under, e.g. Entrées, Plats, Desserts, Boissons' },
          },
          required: ['name', 'price', 'category'],
        },
      },
    },
    required: ['items'],
  },
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'AUTH_REQUIRED' }), { status: 401, headers: corsHeaders })
    }

    const { images } = (await req.json()) as { images?: IncomingImage[] }
    if (!Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'NO_IMAGES' }), { status: 400, headers: corsHeaders })
    }
    if (images.length > MAX_IMAGES) {
      return new Response(JSON.stringify({ error: 'TOO_MANY_IMAGES' }), { status: 400, headers: corsHeaders })
    }
    for (const image of images) {
      if (!image.data || !ALLOWED_MEDIA_TYPES.has(image.media_type)) {
        return new Response(JSON.stringify({ error: 'INVALID_IMAGE' }), { status: 400, headers: corsHeaders })
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 8000,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'extract_menu_items' },
      messages: [
        {
          role: 'user',
          content: [
            ...images.map(
              (image): Anthropic.ImageBlockParam => ({
                type: 'image',
                source: { type: 'base64', media_type: image.media_type as Anthropic.ImageBlockParam['source']['media_type'], data: image.data },
              }),
            ),
            {
              type: 'text',
              text: 'These photos show a restaurant menu (possibly several pages/sections). Extract every dish you can read into the extract_menu_items tool. Keep names and descriptions in the original language. Use one consistent category per section heading. If a price is a range, use the lower bound. Skip items where no price is legible.',
            },
          ],
        },
      ],
    })

    const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
    const items = (toolUse?.input as { items?: unknown[] } | undefined)?.items ?? []

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status ?? 500, headers: corsHeaders })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
