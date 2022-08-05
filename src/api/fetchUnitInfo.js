import axios from "axios";
import { storeToRefs } from "pinia/dist/pinia";
import { useGlobalStateStore } from "../stores/globalState";
import { EventNames } from "../enum/eventEnums";

export default async function fetchUnitInfo(socket, unit) {
  const { wsConnected } = storeToRefs(useGlobalStateStore());

  if (wsConnected.value) {
    return new Promise((resolve) => {
      socket.emit(EventNames.Info, unit, resolve);
    });
  } else {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/unit/${encodeURIComponent(unit)}`
    );
    return data;
  }
}
