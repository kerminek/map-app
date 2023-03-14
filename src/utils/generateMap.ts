import TileNode from "./TileNode";
import calcPosition from "./calcPos";
import randomNum from "./randomNum";
import { neighboursConditions } from "./switchConditions";

const randomFillPercent = 0.495;
const smoothingNumber = 5;

interface cachedMap {
  seed: string | number;
  mapObject: TileNode[];
}
let cachedMap: cachedMap = {
  seed: undefined,
  mapObject: [],
};

export const generateMap = ({
  mapWidth = 30,
  mapHeight = 30,
  seed,
}: {
  mapWidth?: number;
  mapHeight?: number;
  seed?: string | number;
}) => {
  console.time("generating map");
  if (seed === cachedMap.seed) {
    cachedMap.mapObject = cachedMap.mapObject.map((cachedTileNode: TileNode) => {
      const {
        gridX: _gridX,
        gridY: _gridY,
        id: _id,
        walkable: _walkable,
        isSnow: _isSnow,
        isWater: _isWater,
      } = cachedTileNode;
      return (cachedTileNode = new TileNode({ _gridX, _gridY, _id, _walkable, _isSnow, _isWater, _isPath: false }));
    });
    console.timeEnd("generating map");
    return {
      start: generateFreeTileId(cachedMap.mapObject),
      end: generateFreeTileId(cachedMap.mapObject),
      mapObject: cachedMap.mapObject,
    };
  }
  let mapObject: TileNode[] = [];
  // @ts-ignore
  const myrng1 = new Math.seedrandom(seed);

  for (let i = 1; i <= mapWidth * mapHeight; i++) {
    const { col: _gridX, row: _gridY } = calcPosition(i, mapWidth);
    const newTileNode = new TileNode({ _gridX, _gridY, _id: i });
    if (myrng1.quick() < randomFillPercent) newTileNode.walkable = false;
    mapObject.push(newTileNode);
  }

  mapSmoothing(mapObject, smoothingNumber, { mapHeight, mapWidth });

  // processRegions(mapObject, mapWidth, mapHeight);
  //
  let start = generateFreeTileId(mapObject);
  let end = generateFreeTileId(mapObject);

  console.timeEnd("generating map");
  cachedMap = {
    seed,
    mapObject,
  };

  return { start, end, mapObject };
};

export const generateFreeTileId = (mapObject: TileNode[]) => {
  let randomTileId = randomNum(mapObject.length);

  while (!mapObject[randomTileId - 1].walkable) {
    randomTileId = randomNum(mapObject.length);
  }

  return randomTileId;
};

export const mapSmoothing = (
  mapObject: TileNode[],
  howManyTimes: number,
  mapDimensions: { mapWidth: number; mapHeight: number }
) => {
  const { mapWidth, mapHeight } = mapDimensions;
  while (howManyTimes > 0) {
    howManyTimes--;
    let copiedMapObject = [...mapObject];
    copiedMapObject.forEach((currentTile) => {
      let neighbourWallTiles = 0;
      let neighbours = copiedMapObject
        .slice(
          Math.max(currentTile.id - (mapWidth + 2), 0),
          Math.min(currentTile.id + (mapWidth + 1), mapHeight * mapWidth)
        )
        .filter((item) => neighboursConditions(currentTile, item, false));

      neighbours.forEach((neighbour) => {
        if (neighbour.walkable === false) neighbourWallTiles++;
      });

      if (neighbourWallTiles > 4) {
        currentTile.walkable = false;
      } else if (neighbourWallTiles < 4) {
        currentTile.walkable = true;
      }
    });
    mapObject = copiedMapObject;
  }
};

export const getRegionTiles = (tileNode: TileNode, mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  let tiles: TileNode[] = [];
  const mapFlags: Set<TileNode> = new Set();

  let queue: TileNode[] = [];
  queue.splice(0, 0, tileNode);
  mapFlags.add(tileNode);

  while (queue.length > 0) {
    const currentTile = queue.pop();
    tiles.push(currentTile);

    let copiedMapObject = [...mapObject];
    let neighbours = copiedMapObject
      .slice(
        Math.max(currentTile.id - (mapWidth + 2), 0),
        Math.min(currentTile.id + (mapWidth + 1), mapHeight * mapWidth)
      )
      .filter((item) => neighboursConditions(currentTile, item, false, true));

    neighbours.forEach((neighbour) => {
      if (!mapFlags.has(neighbour) && Boolean(neighbour.walkable) === currentTile.walkable) {
        mapFlags.add(neighbour);
        queue.splice(0, 0, neighbour);
      }
    });
  }

  return tiles;
};

export const getRegions = (isWalkable: boolean, mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  const tileType = isWalkable;
  let regions: TileNode[][] = [];
  const mapFlags: Set<TileNode> = new Set();

  mapObject.forEach((tileNode) => {
    if (!mapFlags.has(tileNode) && tileNode.walkable === tileType) {
      const newRegion = getRegionTiles(tileNode, mapObject, mapWidth, mapHeight);
      regions.push(newRegion);

      newRegion.forEach((region) => mapFlags.add(region));
    }
  });

  return regions;
};

export const processRegions = (mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  let whichRegion = false;
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

  //
  whichRegion = true;
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
};
