import TileNode from "./TileNode";
import calcPosition from "./calcPos";
import newTileGenerator from "./newTileGenerator";
import randomNum from "./randomNum";
import { neighboursConditions } from "./switchConditions";

export const generateMap = ({
  mapWidth,
  mapHeight,
  seed,
  multithread,
  randomFillPercent,
  smoothingNumber,
}: {
  mapWidth?: number;
  mapHeight?: number;
  seed?: string | number;
  multithread?: boolean;
  randomFillPercent?: number;
  smoothingNumber?: number;
}) => {
  let mapObject: TileNode[] = [];
  // @ts-ignore
  const myrng1 = new Math.seedrandom(seed);

  for (let i = 1; i <= mapWidth * mapHeight; i++) {
    const { col: _gridX, row: _gridY } = calcPosition(i, mapWidth);
    const newTileNode = new TileNode({ _gridX, _gridY, _id: i });
    if (myrng1.quick() < randomFillPercent) {
      newTileNode.walkable = false;
    } else {
      newTileNode.walkable = true;
    }
    mapObject.push(newTileNode);
  }

  if (multithread) {
    return { mapObject };
  } else {
    mapSmoothing(mapObject, smoothingNumber, { mapHeight, mapWidth });
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

export const threadedMapSmoothing = (
  mapObject: TileNode[],
  smoothingNumber: number,
  mapDimensions: { mapWidth: number; mapHeight: number }
) => {
  return new Promise((resolve, reject) => {
    const { mapWidth, mapHeight } = mapDimensions;
    let allThreads: Worker[] = [];
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
      let worker = new Worker(new URL("./mapSmoothingWorker.ts", import.meta.url), { type: "module" });
      // @ts-ignore
      worker.start = Math.max(Math.floor((mapHeight / navigator.hardwareConcurrency) * i) - 1, 0);
      // @ts-ignore
      worker.end = Math.min(Math.floor((mapHeight / navigator.hardwareConcurrency) * (i + 1)) + 1, mapWidth);

      allThreads.push(worker);
      worker.postMessage({
        // @ts-expect-error
        mapObject: mapObject.slice(worker.start * mapWidth, worker.end * mapWidth),
        smoothingTimes: smoothingNumber,
        mapWidth,
      });
    }
    let noThreadsRes = 0;
    Promise.all(
      allThreads.map((thread) => {
        return new Promise((resolve) => {
          thread.onmessage = (e) => {
            if (e.data.message === "next") {
              e.data.payload.forEach((item) => {
                mapObject[item.id - 1] = item;
              });
              noThreadsRes++;
              if (noThreadsRes === allThreads.length) {
                noThreadsRes = 0;
                allThreads.forEach((worker) => {
                  // @ts-expect-error
                  let mapFragmentStart = mapObject.slice(worker.start * mapWidth, (worker.start + 1) * mapWidth);
                  // @ts-expect-error
                  let mapFragmentEnd = mapObject.slice((worker.end - 1) * mapWidth, worker.end * mapWidth);
                  const mapFragment = {
                    start: mapFragmentStart,
                    end: mapFragmentEnd,
                  };
                  worker.postMessage({
                    mapFragment,
                    message: "mapFragment",
                  });
                });
              }
            } else if (e.data.message === "finished") {
              const t0 = performance.now();
              e.data.payload.forEach((item) => {
                mapObject[item.id - 1] = newTileGenerator(item);
              });
              resolve("success");
              console.log(`setting array to send took ${performance.now() - t0} ms`);
            }
          };
          thread.onerror = (e) => {
            reject(e);
          };
        });
      })
    )
      .then(() => {
        resolve("success");
        allThreads.forEach((thread) => thread.terminate());
      })
      .catch((e) => {
        console.error(e);
        reject(e);
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

  let sorted = freeRegions.sort((a, b) => b.length - a.length);
  sorted.splice(0, 1);

  sorted.forEach((region) => {
    region.forEach((tileNode) => {
      tileNode.isSnow = true;
      tileNode.walkable = false;
    });
  });
};
