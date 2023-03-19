import TileNode from "./TileNode";
import calcPosition from "./calcPos";
import randomNum from "./randomNum";
import { neighboursConditions } from "./switchConditions";

const randomFillPercent = 0.495;
const smoothingNumber = 5;

export const generateMap = ({
  mapWidth = 30,
  mapHeight = 30,
  seed,
  multithread,
}: {
  mapWidth?: number;
  mapHeight?: number;
  seed?: string | number;
  multithread?: boolean;
}) => {
  let mapObject: TileNode[] = [];
  // @ts-ignore
  const myrng1 = new Math.seedrandom(seed);

  for (let i = 1; i <= mapWidth * mapHeight; i++) {
    const { col: _gridX, row: _gridY } = calcPosition(i, mapWidth);
    const newTileNode = new TileNode({ _gridX, _gridY, _id: i });
    if (myrng1.quick() < randomFillPercent) newTileNode.walkable = false;
    mapObject.push(newTileNode);
  }

  if (multithread) {
    // console.log("Multi threading");
    return { mapObject };
  } else {
    mapSmoothing(mapObject, smoothingNumber, { mapHeight, mapWidth });
    // console.log("Single threading");
    processRegions(mapObject, mapWidth, mapHeight);
    let start = generateFreeTileId(mapObject);
    let end = generateFreeTileId(mapObject);
    return { mapObject, start, end };
  }
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
  const originalMultiplier = howManyTimes;
  let times = 0;
  while (howManyTimes > 0) {
    const t0 = performance.now();
    howManyTimes--;
    mapObject.forEach((currentTile) => {
      let neighbourWallTiles = 0;
      let neighbours = mapObject
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
    times += performance.now() - t0;
  }
  console.log(`Singlecore map smoothing in ${times} ms | ${times / originalMultiplier} ms per loop`);
};

export const threadedMapSmoothing = (mapObject: TileNode[], mapDimensions: { mapWidth: number; mapHeight: number }) => {
  return new Promise((resolve, reject) => {
    const { mapWidth, mapHeight } = mapDimensions;
    let allThreads: Worker[] = [];
    for (let i = navigator.hardwareConcurrency; i > 0; i--) {
      allThreads.push(new Worker(new URL("./mapSmoothingWorker.ts", import.meta.url), { type: "module" }));
    }

    let rows: TileNode[][] = [];
    let currentThread = 0;

    let currentRow = 1;
    while (currentRow <= mapHeight) {
      rows.push(mapObject.slice((currentRow - 1) * mapWidth, mapWidth * currentRow));
      currentRow++;
    }
    for (let i = navigator.hardwareConcurrency; i > 0; i--) {
      allThreads.push(new Worker(new URL(import.meta.url), { type: "module" }));
    }
    let lastFetchedRow = 0;
    // const t0 = performance.now();
    allThreads[0].postMessage({ message: "rowsData", payload: { rows: [rows[-1], rows[0], rows[1]] } });
    allThreads.forEach((thread, threadId) => {
      thread.onmessage = (e) => {
        const { message } = e.data;
        switch (message) {
          case "next":
            currentThread = (currentThread + 1) % 8;
            e.data?.payload && (rows[e.data.payload.gridY - 1][e.data.payload.gridX - 1] = e.data.payload);
            allThreads[currentThread].postMessage({ payload: e.data.payload });
            break;
          case "getRows":
            if (lastFetchedRow >= rows.length - 1) return;
            lastFetchedRow++;
            allThreads[threadId].postMessage({
              message: "rowsData",
              payload: { rows: [rows[lastFetchedRow - 1], rows[lastFetchedRow], rows[lastFetchedRow + 1]] },
            });
            break;
          case "backToTop":
            currentThread = 0;
            e.data?.payload && (rows[e.data.payload.gridY - 1][e.data.payload.gridX - 1] = e.data.payload);
            allThreads[currentThread].postMessage("");
            break;
          case "finish":
            // console.log(e.data.payload);
            if (e.data.payload.rowIndex === rows.length - 1) {
              // console.log(`Whole operation has ended in ${performance.now() - t0} ms!`);
              resolve("resolved!!");
            }
            currentThread = threadId + 1;
            allThreads[currentThread].postMessage("last streight");
            break;
          default:
            break;
        }
      };
      thread.onerror = (e) => {
        reject(e);
      };
    });
  });
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
