import TileNode from "./TileNode";
import { generateFreeTileId } from "./generateMap";

interface cachedMap {
  seed: string | number;
  mapObject: TileNode[];
}

interface props {
  newSeed: string;
  mapWidth: number;
  mapHeight: number;
  cachedMap: cachedMap;
  cachedMapSet: React.Dispatch<
    React.SetStateAction<{
      seed: any;
      mapObject: any[];
    }>
  >;
  gameDataSet: React.Dispatch<
    React.SetStateAction<{
      start: number;
      end: number;
      mapObject: TileNode[];
      isFetching: boolean;
    }>
  >;
  seedSet: React.Dispatch<React.SetStateAction<string | number>>;
  mainThread: Worker;
  multithread: boolean;
}

const resetMap = ({
  newSeed,
  mapWidth,
  mapHeight,
  cachedMap,
  cachedMapSet,
  gameDataSet,
  seedSet,
  mainThread,
  multithread,
}: props) => {
  //   console.log(newSeed, cachedMap.seed);
  if (newSeed === cachedMap.seed) {
    const usedCachedMap = cachedMap.mapObject.map((cachedTileNode: TileNode) => {
      const {
        gridX: _gridX,
        gridY: _gridY,
        id: _id,
        walkable: _walkable,
        isSnow: _isSnow,
        isWater: _isWater,
      } = cachedTileNode;
      return (cachedTileNode = new TileNode({
        _gridX,
        _gridY,
        _id,
        _walkable,
        _isSnow,
        _isWater,
        _isPath: false,
      }));
    });

    gameDataSet({
      start: generateFreeTileId(usedCachedMap),
      end: generateFreeTileId(usedCachedMap),
      mapObject: usedCachedMap,
      isFetching: false,
    });
    return;
  } else {
    gameDataSet((prev) => ({ ...prev, isFetching: true }));
    seedSet(newSeed);
    cachedMapSet((prev) => ({ ...prev, seed: newSeed }));

    mainThread.postMessage({ message: "mapGen", payload: { mapWidth, mapHeight, seed: newSeed, multithread } });
  }
};
export default resetMap;
