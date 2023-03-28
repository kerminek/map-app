import { cachedMapStore, gameDataStore, loadingTimeStore, mapPropsStore } from "../store/stores";
import TileNode from "./TileNode";
import { generateFreeTileId, threadedMapSmoothing } from "./generateMap";
import newTileGenerator from "./newTileGenerator";

type Props = {
  mainThreadMessage: MessageEvent<any>;
};

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

    const mapProcessingThreads = [0, 1].map(
      (_) => new Worker(new URL("../utils/subWorkerTest.ts", import.meta.url), { type: "module" })
    );

    let done = 0;
    let processedTilesSet = new Set<TileNode>();
    mapProcessingThreads.forEach((thread) => {
      thread.onmessage = (e) => {
        const res = e.data.processedTiles as TileNode[];

        res.forEach((item) => processedTilesSet.add(item));
        done++;

        if (done === mapProcessingThreads.length) {
          processedTilesSet.forEach((tile) => {
            let oldTile = tempArray[tile.id - 1];
            oldTile.walkable = tile.walkable;
            oldTile.isSnow = tile.isSnow;
            oldTile.isWater = tile.isWater;
          });

          const start = generateFreeTileId(tempArray);
          const end = generateFreeTileId(tempArray);

          loadingTimeStore.set({ ...loadingTimeStore.get(), t1: performance.now() });
          gameDataStore.set({ ...mainThreadMessage.data.payload, mapObject: tempArray, start, end });
          cachedMapStore.set({
            ...cachedMapStore.get(),
            mapObject: tempArray,
          });
        }
      };
    });
    mapProcessingThreads.forEach((thread, index) => {
      thread.postMessage({ mapObject: tempArray, mapWidth, mapHeight, whichProcess: index });
    });
  }
};

export default handleMapGenRes;
