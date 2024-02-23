import { useGlobalStateStore } from "../stores/globalState";
import { EventNames } from "../enum/eventEnums";

export default async function fetchAddressInfo(socket, address, params) {
  const { wsConnected } = storeToRefs(useGlobalStateStore());

  let type = "info";
  if (params.lastInputsROWID) {
    type = "next_page";
  }

  if (wsConnected.value) {
    params.address = address;

    return new Promise((resolve) => {
      if (type === "next_page") {
        socket.emit(EventNames.LoadNextPageAddressTransactions, params, resolve);
        return;
      }
      socket.emit(EventNames.GetAddressData, params, resolve);
    });
  } else {
    const  data = await $fetch(`https://explorer.obyte.org/api/address/${address}/${type}`, {
      params,
    });

    return data;
  }
}
