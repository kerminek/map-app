import TileNode from "./TileNode";

const neighboursConditions = (currentTile: TileNode, item: TileNode, filterWalkable = true, filterDiagonal = false) => {
  if (currentTile.id === item.id) return false;
  if (filterWalkable && !item.walkable) return false;
  if (item.gridX < currentTile.gridX - 1 || item.gridX > currentTile.gridX + 1) return false;
  if (item.gridY < currentTile.gridY - 1 || item.gridY > currentTile.gridY + 1) return false;
  if (filterDiagonal) {
    if (currentTile.gridX === item.gridX || currentTile.gridY === item.gridY) return true;
    return false;
  }
  return true;
};

export { neighboursConditions };
