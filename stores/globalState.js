import { unref } from "vue";

export const useGlobalStateStore = defineStore("globalState", {
  state: () => {
    const viewInCookie = useCookie("T_VIEW")
    return {
      view: unref(viewInCookie.value) || "Transfers",
      lastUnit: "",
      searchInputFocused: false,
      wsConnected: false,
    };
  },
  actions: {
    setView(view) {
      this.view = view;
    },
    setLastUnit(unit) {
      this.lastUnit = unit;
    },
    setSearchInputFocused(value) {
      this.searchInputFocused = value;
    },
    setWSConnected(value) {
      this.wsConnected = value;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlobalStateStore, import.meta.hot));
}
