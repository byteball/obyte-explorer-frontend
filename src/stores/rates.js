import { acceptHMRUpdate, defineStore } from "pinia";

export const useRatesStore = defineStore("rates", {
  state: () => {
    return {
      rates: {},
    };
  },
  actions: {
    setRates(rates) {
      this.rates = { ...this.rates, ...rates };
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRatesStore, import.meta.hot));
}
