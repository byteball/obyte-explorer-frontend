import { useGlobalStateStore } from "../stores/globalState";
import { EventNames } from "../enum/eventEnums";
import { pathToExplorer } from "~/configs/pathToExplorer.js";

export default async function fetchUnitInfo(socket, unit) {
  const { wsConnected } = storeToRefs(useGlobalStateStore());

  if (wsConnected.value) {
    return new Promise((resolve) => {
      socket.emit(EventNames.Info, unit, resolve);
    });
  } else {
    const data = await $fetch(`${pathToExplorer}/api/unit/${encodeURIComponent(unit)}`);

    return data;
  }
}
