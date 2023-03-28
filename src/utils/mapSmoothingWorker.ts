import { neighboursConditions } from "./switchConditions";

const requireVal = {
  forWall: 4,
  forAir: 4,
};

let smoothingTimes = undefined;
let mapWidth = undefined;
let mapObject = undefined;
let position = undefined;

self.onmessage = (e: MessageEvent) => {
  if (e.data.smoothingTimes) smoothingTimes = e.data.smoothingTimes;
  if (!smoothingTimes) return postMessage({ message: "finished", payload: [] });
  if (e.data.mapWidth) mapWidth = e.data.mapWidth;
  if (e.data.mapObject) {
    mapObject = e.data.mapObject;
    position = {
      notStart: mapObject[0].id !== 1,
      notEnd: mapObject.at(-1).id !== 40000,
    };
  } else if (e.data.mapFragment) {
    mapObject.splice(0, e.data.mapFragment.start.length, ...e.data.mapFragment.start);
    mapObject.splice(
      mapObject.length - e.data.mapFragment.end.length,
      e.data.mapFragment.end.length,
      ...e.data.mapFragment.end
    );
  }

  let changedObjects = new Set();

  let mapObjectCopy = mapObject.slice(
    position.notStart ? mapWidth : 0,
    mapObject.length - (position.notEnd ? mapWidth : 0)
  );

  smoothingTimes--;
  mapObjectCopy.forEach((currentTile, index) => {
    let neighbourWallTiles = 0;
    let neighbours = getNeighbours(index + (position.notStart ? mapWidth : 0), mapObject, mapWidth);

    neighbours = neighbours.filter((item) => neighboursConditions(currentTile, item, false));
    neighbours.forEach((neighbour) => {
      if (neighbour.walkable === false) neighbourWallTiles++;
    });

    if (neighbourWallTiles > requireVal.forWall) {
      currentTile.walkable = false;
    } else if (neighbourWallTiles < requireVal.forWall) {
      currentTile.walkable = true;
    }
    changedObjects.add(currentTile);
  });

  if (smoothingTimes === 0) {
    return postMessage({ payload: changedObjects, message: "finished" });
  } else {
    let objToSend = mapObjectCopy.slice(0, mapWidth);
    objToSend = [...objToSend, ...mapObjectCopy.slice(mapObjectCopy.length - mapWidth)];

    return postMessage({ payload: objToSend, message: "next" });
  }
};

const getNeighbours = (index, mapObject, mapWidth) => {
  let neighs = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const inx = index + mapWidth * x + 1 * y;
      const item = mapObject[inx];
      item && neighs.push(item);
    }
  }
  return neighs;
};
