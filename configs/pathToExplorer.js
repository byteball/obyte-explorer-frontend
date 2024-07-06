import { isDevNet } from "./isDevNet.js";

let path = '';
if (isDevNet) {
  path = 'http://localhost:4000';
} else {
  path = import.meta.env.VITE_TESTNET ? 'https://testnetexplorer.obyte.org' : 'https://explorer.obyte.org';
}

export const pathToExplorer = path;  
