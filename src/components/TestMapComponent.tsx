import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { gameDataStore, mapPropsStore } from "../store/stores";

const TestMapComponent = () => {
  const mapProps = useStore(mapPropsStore);
  const gameData = useStore(gameDataStore);
  const { mapHeight, mapWidth, sharpness = 1 } = mapProps;

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
      ctx.fillRect((item.gridX - 1) * sharpness, (item.gridY - 1) * sharpness, sharpness, sharpness);
    });
  }, [gameData]);

  return (
    <canvas
      height={mapHeight * sharpness}
      width={mapWidth * sharpness}
      className="border-2 border-black w-[80vmin]"
      id="canvasMap"
    >
      TestMapComponent
    </canvas>
  );
};

export default TestMapComponent;
