import TileNode from "./TileNode";
import { generateFreeTileId } from "./generateMap";
import newTileGenerator from "./newTileGenerator";
import { cachedMapStore, gameDataStore, loadingTimeStore, mainThreadStore, mapPropsStore } from "../store/stores";

let oldSeed: string;

const resetMap = (newSeed = oldSeed) => {
  console.clear();
  oldSeed = newSeed;

  const mapProps = mapPropsStore.get();
  const gameData = gameDataStore.get();
  const cachedMap = cachedMapStore.get();
  const mainThread = mainThreadStore.get();
  const { mapHeight, mapWidth, multithread, randomFillPercent, smoothingNumber } = mapProps;

  if (newSeed === cachedMap.seed) {
    const usedCachedMap = cachedMap.mapObject.map((cachedTileNode: TileNode) => {
      cachedTileNode.isPath = false;
      return newTileGenerator(cachedTileNode);
    });

    gameDataStore.set({
      start: generateFreeTileId(usedCachedMap),
      end: generateFreeTileId(usedCachedMap),
      mapObject: usedCachedMap,
      isFetching: false,
    });
    return;
  } else {
    loadingTimeStore.set({ t0: performance.now(), t1: null });
    gameDataStore.set({ ...gameData, isFetching: true });
    mapPropsStore.set({ ...mapProps, seed: newSeed });
    cachedMapStore.set({ ...cachedMap, seed: newSeed });

    mainThread.postMessage({
      message: "mapGen",
      payload: { mapWidth, mapHeight, seed: newSeed, multithread, randomFillPercent, smoothingNumber },
    });
  }
};
export default resetMap;
