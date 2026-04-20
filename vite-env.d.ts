// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_FLASH_MODEL: string;
  readonly VITE_GEMINI_PRO_MODEL: string;
  readonly VITE_LLAMA_TEXT_MODEL: string;
  readonly VITE_LLAMA_EMBEDDING_MODEL: string;
  readonly VITE_LLAMA_TYPE_MODEL: string;
  readonly VITE_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
