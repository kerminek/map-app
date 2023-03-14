import TileNode from "./TileNode";
import { getRegions } from "./generateMap";

self.onmessage = (e: MessageEvent) => {
  let tempArray = [];
  e.data.mapObject.forEach((item) =>
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
  processRegions(tempArray, e.data.mapWidth, e.data.mapHeight, e.data.whichProcess);

  self.postMessage(tempArray);
};

const processRegions = (mapObject: TileNode[], mapWidth: number, mapHeight: number, whichProcess: number) => {
  if (whichProcess === 0) {
    const whichRegion = false;
    const wallRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
    const wallThreshold = mapWidth / 2;
    const secondWallThreshold = wallThreshold * 4;

    wallRegions.forEach((region) => {
      if (region.length < wallThreshold) {
        region.forEach((tileNode) => {
          tileNode.walkable = true;
        });
      } else if (region.length < secondWallThreshold) {
        region.forEach((tileNode) => {
          tileNode.isWater = true;
          tileNode.walkable = false;
        });
      }
    });
  } else if (whichProcess === 1) {
    //
    const whichRegion = true;
    const freeRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
    const freeThreshold = Math.max(5, mapWidth / 2);
    const secondFreeThreshold = freeThreshold * 4;

    freeRegions.forEach((region) => {
      if (region.length < freeThreshold) {
        region.forEach((tileNode) => {
          tileNode.walkable = false;
        });
      } else if (region.length < secondFreeThreshold) {
        region.forEach((tileNode) => {
          tileNode.isSnow = true;
          tileNode.walkable = false;
        });
      }
    });
  }
};
