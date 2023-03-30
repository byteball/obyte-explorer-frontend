import { acceptHMRUpdate, defineStore } from "pinia";

const basicAssets = ["GBYTE", "GBB", "MBYTE", "KBYTE", "byte", "blackbytes"];

export const useAssetNamesStore = defineStore("assetNames", {
  state: () => {
    return {
      assetNames: [],
    };
  },
  actions: {
    setAssetNames(assetNames) {
      this.assetNames = [...basicAssets, ...assetNames];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAssetNamesStore, import.meta.hot));
}
