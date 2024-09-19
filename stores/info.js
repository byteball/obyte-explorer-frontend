export const useInfoStore = defineStore("info", {
  state: () => {
    return {
      isReady: false,
      loading: false,
      info: {},
    };
  },
  getters: {
    authors: (state) => {
      if (!state.info.authors) return [];

      return state.info.authors.map((v) => v.address);
    },
  },
  actions: {
    setInfo(info) {
      this.info = info;
    },
    setReady(status) {
      this.isReady = status;
    },
    setLoading(status){
      this.loading = status;
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInfoStore, import.meta.hot));
}
