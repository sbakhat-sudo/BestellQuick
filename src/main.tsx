import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/i18n'
import './index.css'
import App from './App.tsx'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

function ConfigError() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Configuration Supabase manquante</h1>
        <p style={{ color: '#525252', lineHeight: 1.5 }}>
          Les variables d'environnement <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> ne sont
          pas définies. Sans elles, l'application ne peut pas démarrer.
        </p>
        <p style={{ color: '#525252', lineHeight: 1.5, marginTop: 12 }}>
          Ajoutez-les dans les paramètres de votre plateforme de déploiement (ou dans un fichier <code>.env</code> en
          local à partir de <code>.env.example</code>), puis redéployez.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    ) : (
      <ConfigError />
    )}
  </StrictMode>,
)
