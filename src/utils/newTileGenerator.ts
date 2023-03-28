import TileNode from "./TileNode";

type props = {
  gridX: number;
  gridY: number;
  id: number;
  isPath: boolean;
  isSnow: boolean;
  isWater: boolean;
  walkable: boolean;
};

const newTileGenerator = (item: props) => {
  return new TileNode({
    _gridX: item.gridX,
    _gridY: item.gridY,
    _id: item.id,
    _isPath: item.isPath,
    _isSnow: item.isSnow,
    _isWater: item.isWater,
    _walkable: item.walkable,
  });
};

export default newTileGenerator;
