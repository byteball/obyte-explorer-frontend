import { useGlobalStateStore } from "../stores/globalState";
import { EventNames } from "../enum/eventEnums";
import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchUnitInfo(socket, unit) {
  const { wsConnected } = storeToRefs(useGlobalStateStore());

  if (wsConnected.value) {
    return new Promise((resolve) => {
      socket.emit(EventNames.Info, unit, resolve);
    });
  } else {
    const data = await $fetch(`${getPathToServer()}/api/unit/${encodeURIComponent(unit)}`);

    return data;
  }
}
