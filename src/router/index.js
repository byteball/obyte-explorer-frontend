import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const redirectAssetList = {
  MBYTE: "GBYTE",
  KBYTE: "GBYTE",
  byte: "GBYTE",
  blackbytes: "GBB",
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/:unit(.*)?",
      name: "home",
      component: HomeView,
    },
    {
      path: "/address/:address",
      name: "address",
      component: () => import("../views/AddressView.vue"),
    },
    {
      path: "/asset/:asset(.*)",
      name: "asset",
      component: () => import("../views/AssetView.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.name === "asset") {
    if (!to.params.asset) {
      return next({ name: "home" });
    }

    if (redirectAssetList[to.params.asset]) {
      const asset = redirectAssetList[to.params.asset];
      return next({ name: "asset", params: { asset } });
    }
  }

  next();
});

export default router;
