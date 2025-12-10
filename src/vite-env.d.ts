/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_PROJECT_ID: string
    readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
    readonly VITE_PAYSTACK_PUBLIC_KEY: string
    readonly VITE_ADMIN_EMAIL: string
    readonly VITE_ADMIN_SECRET_KEY: string
    readonly VITE_TMDB_API_KEY?: string
    readonly PROD: boolean
    readonly MODE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
