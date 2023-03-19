import { useEffect } from "react";
import TileNode from "../utils/TileNode";

type Props = {
  mapHeight: number;
  mapWidth: number;
  gameData: {
    start: number;
    end: number;
    mapObject: TileNode[];
    isFetching: boolean;
  };
};

const TestMapComponent = (props: Props) => {
  const { mapHeight, mapWidth, gameData } = props;

  useEffect(() => {
    const c: HTMLCanvasElement = document.getElementById("canvasMap") as HTMLCanvasElement;
    const ctx = c.getContext("2d");
    gameData.mapObject.forEach((item) => {
      ctx.fillStyle =
        (item.id === gameData.start && "red") ||
        (item.id === gameData.end && "blue") ||
        (item.isPath && "orange") ||
        (item.walkable && "green") ||
        (item.isSnow && "white") ||
        (item.isWater && "blue") ||
        "grey";
      ctx.fillRect((item.gridX - 1) * 4, (item.gridY - 1) * 4, 4, 4);
    });
  }, [gameData]);

  return (
    <canvas height={mapHeight * 4} width={mapWidth * 4} className="border-2 border-black" id="canvasMap">
      TestMapComponent
    </canvas>
  );
};

export default TestMapComponent;
