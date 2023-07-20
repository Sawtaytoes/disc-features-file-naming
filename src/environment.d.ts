declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ANIDB_PASSWORD: string;
      ANIDB_USERNAME: string;
      X_MAL_CLIENT_ID: string;
    }
  }
}

export {}
