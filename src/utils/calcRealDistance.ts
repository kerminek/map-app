import { gameDataStore, mapPropsStore } from "../store/stores";
import Heap from "./Heap";
import TileNode from "./TileNode";
import retracePath from "./retracePath";
import { neighboursConditions } from "./switchConditions";

export const calcRealDistance = () => {
  const { mapHeight, mapWidth } = mapPropsStore.get();
  const gameData = gameDataStore.get();

  const startTile = gameData.mapObject[gameData.start - 1];
  const targetTile = gameData.mapObject[gameData.end - 1];

  let copiedArray = { ...gameData };
  let openSet = new Heap(mapHeight * mapWidth);
  let closedSet = new Set<TileNode>();

  openSet.Add(startTile);

  console.time("searching path");
  while (openSet.Count > 0) {
    let currentTile: TileNode = openSet.RemoveFirst();
    closedSet.add(currentTile);

    if (currentTile.id === targetTile.id) {
      console.timeEnd("searching path");
      console.log("we found it!");

      const path = retracePath(startTile, targetTile);

      gameDataStore.set(copiedArray);
      // console.log(path);
      break;
    }

    let neighbours = copiedArray.mapObject
      .slice(
        Math.max(currentTile.id - (mapWidth + 2), 0),
        Math.min(currentTile.id + (mapWidth + 1), mapHeight * mapWidth)
      )
      .filter((item) => neighboursConditions(currentTile, item) && !closedSet.has(item));

    neighbours.forEach((neighbour) => {
      const newMovementCostToNeighbour = (currentTile.gCost ||= 0) + getDistance(currentTile, neighbour);
      if (newMovementCostToNeighbour < neighbour.gCost || !openSet.Contains(neighbour)) {
        neighbour.gCost = newMovementCostToNeighbour;
        neighbour.hCost = getDistance(neighbour, targetTile);
        neighbour.parent = currentTile;

        if (!openSet.Contains(neighbour)) {
          openSet.Add(neighbour);
        } else {
          openSet.UpdateItem(neighbour);
        }
      }
    });
  }
};

const getDistance = (nodeA: TileNode, nodeB: TileNode) => {
  const dstX = Math.abs(nodeA.gridX - nodeB.gridX);
  const dstY = Math.abs(nodeA.gridY - nodeB.gridY);

  if (dstX > dstY) return 14 * dstY + 10 * (dstX - dstY);
  return 14 * dstX + 10 * (dstY - dstX);
};
