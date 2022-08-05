import { io } from "socket.io-client";
import { useRatesStore } from "../stores/rates";
import { useAssetNamesStore } from "../stores/assetNames";
import { useGlobalStateStore } from "../stores/globalState";

export const socketIoPlugin = {
  install: (app, options) => {
    if (!options.url) {
      throw new Error("Please set VITE_API_URL");
    }
    const ratesStore = useRatesStore();
    const assetNamesStore = useAssetNamesStore();
    const globalStateStore = useGlobalStateStore();
    const socket = io(options.url);

    socket.on("connect", () => {
      globalStateStore.setWSConnected(true);
    });

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

    app.provide("socket.io", socket);
  },
};
