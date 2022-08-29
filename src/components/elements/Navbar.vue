<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AutoComplete from "@tarekraafat/autocomplete.js";
import IconDiscord from "../icons/IconDiscord.vue";
import IconTwitter from "../icons/IconTwitter.vue";

import { useGlobalStateStore } from "../../stores/globalState";
import { useAssetNamesStore } from "../../stores/assetNames";
import ObyteLogo from "../icons/ObyteLogo.vue";

const { t } = useI18n();
const router = useRouter();

const globalState = useGlobalStateStore();
const { assetNames } = storeToRefs(useAssetNamesStore());

const searchValue = ref("");
const view = ref("Transfers");
const SI = ref();
const autoComplete = ref();

function search(value, raw) {
  value = value.trim();
  if (!value) return;

  if (raw) {
    if (value.length === 32) {
      router.push(`/address/${value}`);
    } else {
      router.push(`/${value}`);
    }

    return;
  }

  router.push(`/asset/${value}`);
}

function searchEventHandler() {
  const matches = autoComplete.value.feedback.matches;
  if (autoComplete.value.cursor === -1) {
    if (matches.length) {
      search(matches[0].value);
      autoComplete.value.close();
    } else {
      search(searchValue.value, 1);
    }
  } else if (matches[autoComplete.value.cursor]) {
    search(matches[autoComplete.value.cursor].value);
  }
  searchValue.value = "";
}

function keyDown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    searchEventHandler();
  }
}

watch(view, () => {
  globalState.setView(view.value);
  localStorage.setItem("T_VIEW", view.value);
});

onBeforeMount(() => {
  let v = localStorage.getItem("T_VIEW") || "Transfers";
  if (!v || (v !== "Transfers" && v !== "UTXO")) {
    v = "Transfers";
  }
  globalState.setView(v);
  view.value = v;
});

onMounted(() => {
  SI.value.addEventListener("keydown", keyDown);
  autoComplete.value = new AutoComplete({
    selector: "#searchInput",
    submit: true,
    placeHolder: t("searchUnitOrAddress"),
    data: {
      src: async () => {
        return assetNames.value;
      },
    },
    resultsList: {
      maxResults: 20,
    },
    resultItem: {
      highlight: true,
    },
    events: {
      input: {
        selection: (e) => {
          if (e.detail.event.type === "click") {
            search(e.detail.selection.value);
            searchValue.value = "";
          }
        },
      },
    },
  });
});

onBeforeUnmount(() => {
  SI.value.removeEventListener("keydown", keyDown);
});

function searchFocused() {
  globalState.setSearchInputFocused(true);
}

function searchBlur() {
  globalState.setSearchInputFocused(false);
}
</script>

<template>
  <div
    class="navbar !grid justify-items-center lg:!flex bg-base-100 border-b py-0 fixed top-0 left-0 w-full"
    style="z-index: 1200"
  >
    <div class="grid sm:flex flex-1">
      <router-link
        to="/"
        class="btn btn-ghost normal-case text-xl !bg-white !pl-0 !pr-2"
        title="Home page"
      >
        <ObyteLogo class="h-10" />
      </router-link>
      <div class="relative form-control w-3/6 max-w-xs" style="padding-top: 1px">
        <div class="input-group">
          <input
            type="text"
            id="searchInput"
            ref="SI"
            v-model="searchValue"
            @focus="searchFocused"
            @blur="searchBlur"
            class="input input-ghost w-full max-w-xs text-base pr-2.5 hover:outline-0 focus:outline-0"
          />
          <button
            class="btn btn-square btn-ghost text-blue-500 btn-sm w-10 h-10"
            style="border: 1px solid rgba(33, 33, 33, 0.2); border-left: none"
            @click="searchEventHandler"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="flex-none gap-2">
      <select v-model="view" class="select focus:outline-0 focus:border-0 !pr-8">
        <option value="Transfers">Transfers view</option>
        <option value="UTXO">UTXO view</option>
      </select>
      <a class="btn btn-ghost normal-case" href="https://obyte.org" target="_blank">Obyte.org</a>
      <a class="btn btn-circle btn-ghost" href="https://twitter.com/ObyteOrg" target="_blank">
        <IconTwitter class="w-6 h-6" />
      </a>
      <a class="btn btn-circle btn-ghost" href="https://obyte.org/discord" target="_blank">
        <IconDiscord class="w-5 h-5" />
      </a>
    </div>
  </div>
</template>

<style scoped>
#searchInput {
  font-size: 14px !important;
}
</style>

<style>
.autoComplete_wrapper > ul > li mark {
  color: #2980b9 !important;
}

.autoComplete_wrapper > ul {
  top: 80% !important;
}

.autoComplete_wrapper > input::placeholder {
  color: rgb(117, 117, 117) !important;
}
</style>
