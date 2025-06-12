import { io } from "socket.io-client";

import { useGlobalStateStore } from "~/stores/globalState";
import { useRatesStore } from "~/stores/rates";
import { useAssetNamesStore } from "~/stores/assetNames";

import { isDevNet } from "~/configs/isDevNet";
import { getPathToServer } from "~/configs/pathToExplorer";

export default defineNuxtPlugin(() => {
  if (import.meta.server) return;
  const socket = isDevNet ? io(getPathToServer()) : io();

  const ratesStore = useRatesStore();
  const assetNamesStore = useAssetNamesStore();
  const globalStateStore = useGlobalStateStore();
  
  socket.on("connect", () => {
    globalStateStore.setWSConnected(true);
  })

  socket.on("disconnect", () => {
    globalStateStore.setWSConnected(false);
  });

  socket.on("rates_updated", function (data) {
    console.log("rates_updated: ", data);
    ratesStore.setRates(data);
  });

  socket.on("updateAssetsList", function (assetNames) {
    console.log("updateAssetsList: ", assetNames);
    assetNamesStore.setAssetNames(assetNames);
  });

  return {
    provide: {
      socket
    }
  }
})
