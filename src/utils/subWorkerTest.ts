import TileNode from "./TileNode";
import { getRegions } from "./generateMap";

self.onmessage = (e: MessageEvent) => {
  let tempArray = e.data.mapObject;
  let processedTiles: TileNode[] = [];

  processRegions(tempArray, e.data.mapWidth, e.data.mapHeight, e.data.whichProcess, processedTiles);

  self.postMessage({ processedTiles });
};

const processRegions = (
  mapObject: TileNode[],
  mapWidth: number,
  mapHeight: number,
  whichProcess: number,
  processedTiles: TileNode[]
) => {
  if (whichProcess === 0) {
    const t0 = performance.now();
    const whichRegion = false;
    const wallRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
    const wallThreshold = mapWidth / 2;
    const secondWallThreshold = wallThreshold * 4;

    wallRegions.forEach((region) => {
      if (region.length < wallThreshold) {
        region.forEach((tileNode) => {
          tileNode.walkable = true;

          processedTiles.push(tileNode);
        });
      } else if (region.length < secondWallThreshold) {
        region.forEach((tileNode) => {
          tileNode.isWater = true;
          tileNode.walkable = false;

          processedTiles.push(tileNode);
        });
      }
    });
    console.log(`subWorker ${whichProcess} took ${performance.now() - t0} ms`);
  } else if (whichProcess === 1) {
    const t0 = performance.now();
    const whichRegion = true;
    const freeRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
    const freeThreshold = Math.max(5, mapWidth / 2);
    const secondFreeThreshold = freeThreshold * 4;

    freeRegions.forEach((region) => {
      if (region.length < freeThreshold) {
        region.forEach((tileNode) => {
          tileNode.walkable = false;

          processedTiles.push(tileNode);
        });
      } else if (region.length < secondFreeThreshold) {
        region.forEach((tileNode) => {
          tileNode.isSnow = true;
          tileNode.walkable = false;

          processedTiles.push(tileNode);
        });
      }
    });
    console.log(`subWorker ${whichProcess} took ${performance.now() - t0} ms`);
  }
};
