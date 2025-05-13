import { isDevNet } from "./isDevNet.js";

export const getPathToServer = () => {
  if (isDevNet) {
    return 'http://localhost:8080';
  }
  
  if (import.meta.server && import.meta.env.VITE_PATH_TO_LOCAL_SERVER) {
    return import.meta.env.VITE_PATH_TO_LOCAL_SERVER;
  }
  
  return import.meta.env.VITE_TESTNET ? 'https://testnetexplorer.obyte.org' : 'https://explorer.obyte.org';
}

