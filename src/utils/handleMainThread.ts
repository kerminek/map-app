import { useEffect } from "react";
import { loadingTimeStore, mapPropsStore } from "../store/stores";
import handleMapGenRes from "./handleMapGenRes";

export const handleMainThread = (mainThread: Worker) => {
  const mapProps = mapPropsStore.get();

  useEffect(() => {
    if (window.Worker) {
      loadingTimeStore.set({ t0: performance.now(), t1: null });
      mainThread.postMessage({
        message: "mapGen",
        payload: mapProps,
      });

      mainThread.onmessage = (mainThreadMessage) => {
        if (mainThreadMessage.data.message !== "mapGenRes") return;
        handleMapGenRes({
          mainThreadMessage,
        });
      };
      mainThread.onerror = (e) => {
        console.error(e);
      };
    }
  }, []);
};
