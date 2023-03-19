import TileNode from "./TileNode";
import { generateFreeTileId, threadedMapSmoothing } from "./generateMap";

type Props = {
  mainThreadMessage: MessageEvent<any>;
  multithread: boolean;
  t0: number;
  t1: number;
  mapWidth: number;
  mapHeight: number;
  gameDataSet: React.Dispatch<
    React.SetStateAction<{
      start: number;
      end: number;
      mapObject: TileNode[];
      isFetching: boolean;
    }>
  >;
  cachedMapSet: React.Dispatch<
    React.SetStateAction<{
      seed: string;
      mapObject: any[];
    }>
  >;
  loadingTimeSet: React.Dispatch<React.SetStateAction<number>>;
};
const handleMapGenRes = async (props: Props) => {
  let { mainThreadMessage, multithread, t0, t1, mapWidth, mapHeight, gameDataSet, cachedMapSet, loadingTimeSet } =
    props;
  let tempArray: TileNode[] = [];
  mainThreadMessage.data.payload.mapObject.forEach((item) =>
    tempArray.push(
      new TileNode({
        _gridX: item.gridX,
        _gridY: item.gridY,
        _id: item.id,
        _isPath: item.isPath,
        _isSnow: item.isSnow,
        _isWater: item.isWater,
        _walkable: item.walkable,
      })
    )
  );
  console.log(
    `${multithread ? "multithread" : "singlethread"}---Generating basic plate took: ${
      performance.now() - t0
    } miliseconds.`
  );
  if (!multithread) {
    t1 = performance.now();
    console.log(`Generating map took: ${t1 - t0} miliseconds.`);
    gameDataSet({ ...mainThreadMessage.data.payload, mapObject: tempArray });
    cachedMapSet((prev) => ({ ...prev, mapObject: tempArray }));
    loadingTimeSet(t1 - t0);
  } else {
    // TODO: handle threadedMapSmoothing
    const tTest = performance.now();
    await threadedMapSmoothing(tempArray, { mapHeight, mapWidth });
    console.log(`Whole async operation has ended in ${performance.now() - tTest} ms!`);

    // 1) Check how many threads there is

    // 2) Create list of available threads

    // 3) Assign each one of them for one free(!) row

    // 4) Double lock every column and the previous one

    //
    const mapProcessingThreads = [0, 1].map(
      (_) => new Worker(new URL("../utils/subWorkerTest.ts", import.meta.url), { type: "module" })
    );

    let done = 0;
    let processedTilesSet = new Set<TileNode>();
    mapProcessingThreads.forEach((thread) => {
      thread.onmessage = (e) => {
        const res = e.data.processedTiles as TileNode[];
        // console.log(res);

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
          t1 = performance.now();
          console.log(`multithread---Generating map took: ${t1 - t0} miliseconds.`);
          gameDataSet({ ...mainThreadMessage.data.payload, mapObject: tempArray, start, end });
          cachedMapSet((prev) => ({
            ...prev,
            mapObject: tempArray,
          }));
          loadingTimeSet(t1 - t0);
        }
      };
    });
    mapProcessingThreads.forEach((thread, index) => {
      thread.postMessage({ mapObject: tempArray, mapWidth, mapHeight, whichProcess: index });
    });
  }
};

export default handleMapGenRes;
