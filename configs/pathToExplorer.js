import { isDevNet } from "./isDevNet.js";

let path = '';
if (isDevNet) {
  path = 'http://localhost:8080';
} else {
  path = import.meta.env.VITE_TESTNET ? 'https://testnetexplorer.obyte.org' : 'https://explorer.obyte.org';
}

export const pathToExplorer = path;  
