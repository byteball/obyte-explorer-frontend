import axios from "axios";
import { storeToRefs } from "pinia";
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
    const { data } = await axios.get(`/api/asset/${asset}/next_page_holders`, {
      params,
    });
    return data;
  }
}
