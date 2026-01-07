/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIMO_KEY: string
  readonly VITE_MIMO_BASE_URL: string
  readonly API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';
