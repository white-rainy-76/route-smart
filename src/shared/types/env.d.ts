declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string
  export const EXPO_PUBLIC_API_KEY: string
}

// Для Expo используем process.env напрямую
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string
    EXPO_PUBLIC_API_KEY: string
  }
}
