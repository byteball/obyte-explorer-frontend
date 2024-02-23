import { useGlobalStateStore } from "../stores/globalState";
import { EventNames } from "../enum/eventEnums";

export default async function fetchNextHolders(socket, asset, params) {
  const { wsConnected } = storeToRefs(useGlobalStateStore());

  if (wsConnected.value) {
    params.asset = asset;
    return new Promise((resolve) => {
      socket.emit(EventNames.LoadNextPageAssetHolders, params, resolve);
    });
  } else {
    const data = await $fetch(`https://explorer.obyte.org/api/asset/${asset}/next_page_holders`, {
      params,
    });

    return data;
  }
}
