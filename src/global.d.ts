/// <reference types="vite/client" />

export { }

declare global {
  interface ImportMetaEnv extends ViteEnv { }

  declare interface ViteEnv {
    VITE_LOGTO_ENDPOINT: string;
    VITE_LOGTO_APPID: string;
  }

}
