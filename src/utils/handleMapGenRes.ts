import { cachedMapStore, gameDataStore, loadingTimeStore, mapPropsStore } from "../store/stores";
import TileNode from "./TileNode";
import { threadedMapSmoothing } from "./generateMap";
import newTileGenerator from "./newTileGenerator";

type Props = {
  mainThreadMessage: MessageEvent<any>;
};

const mapProcessingThread = new Worker(new URL("./subWorkerTest.ts", import.meta.url), { type: "module" });

const handleMapGenRes = async (props: Props) => {
  let { mainThreadMessage } = props;
  const { multithread, smoothingNumber, mapWidth, mapHeight } = mapPropsStore.get();

  let tempArray: TileNode[] = [];
  mainThreadMessage.data.payload.mapObject.forEach((item) => tempArray.push(newTileGenerator(item)));

  if (!multithread) {
    loadingTimeStore.set({ ...loadingTimeStore.get(), t1: performance.now() });
    gameDataStore.set({ ...mainThreadMessage.data.payload, mapObject: tempArray });
    cachedMapStore.set({ ...cachedMapStore.get(), mapObject: tempArray });
  } else {
    await threadedMapSmoothing(tempArray, smoothingNumber, { mapHeight, mapWidth });

    mapProcessingThread.postMessage({ mapObject: tempArray, mapWidth, mapHeight });
    mapProcessingThread.onmessage = (e) => {
      let { mapObject, start, end } = e.data;
      mapObject = mapObject.map((item) => newTileGenerator(item));

      loadingTimeStore.set({ ...loadingTimeStore.get(), t1: performance.now() });
      gameDataStore.set({ ...mainThreadMessage.data.payload, mapObject, start, end });
      cachedMapStore.set({
        ...cachedMapStore.get(),
        mapObject,
      });
    };
  }
};

export default handleMapGenRes;
