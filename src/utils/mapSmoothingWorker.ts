import TileNode from "./TileNode";
import { neighboursConditions } from "./switchConditions";

let currentRows: TileNode[][] = [];
let currentRowIndex: number = undefined;
let currColIndex = 0;

const mapWidth = 200;
const mapHeight = 200;

self.onmessage = (e: MessageEvent) => {
  if (e.data.message === "rowsData") {
    currentRows = e.data.payload.rows;
    currentRowIndex = currentRows[1][0].gridY - 1;
  }
  if (!currentRows.length) {
    getRowsData(e);
    return;
  }
  if (currColIndex > currentRows[1]?.length - 1) {
    if (currentRowIndex + 8 >= mapHeight) {
      self.postMessage({ message: "finish", payload: { rowIndex: currentRowIndex } });
      return;
    }
    getRowsData();
    return;
  }
  if (e.data.payload?.id) {
    if (currentRows[0]) {
      currentRows[0][currColIndex + 2] = e.data.payload;
    }
  }
  // doing something important here...
  const currentTile = smoothingFunction();
  //

  if (currColIndex < currentRows[1]?.length) {
    currColIndex++;
    if (currentRowIndex <= 7 && currColIndex <= 2) {
      self.postMessage({ message: "backToTop", payload: currentTile });
      return;
    }
    self.postMessage({ message: "next", payload: currentTile });
  }
};

//

const getRowsData = (e?: MessageEvent) => {
  self.postMessage({ message: "getRows" });
  currColIndex = 0;
};

const smoothingFunction = () => {
  let currentTile = currentRows[1][currColIndex];
  let neighbourWallTiles = 0;
  let neighbours = currentRows.filter((item) => item).flat();
  const tileIndex = neighbours.findIndex((item) => item.id === currentTile.id);
  neighbours = neighbours
    .slice(Math.max(tileIndex - (mapWidth + 1), 0), Math.min(tileIndex + (mapWidth + 1), 3 * mapWidth))
    .filter((item) => neighboursConditions(currentTile, item, false));

  neighbours.forEach((neighbour) => {
    if (neighbour.walkable === false) neighbourWallTiles++;
  });

  if (neighbourWallTiles > 4) {
    currentTile.walkable = false;
  } else if (neighbourWallTiles < 4) {
    currentTile.walkable = true;
  }

  return currentTile;
};
