import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { gameDataStore, mapPropsStore } from "../store/stores";

const MapComponent = () => {
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
        (item.isPath && "#9b7653") ||
        (item.walkable && "green") ||
        (item.isSnow && "#336600") ||
        (item.isWater && "blue") ||
        "darkgreen";
      ctx.fillRect((item.gridX - 1) * sharpness, (item.gridY - 1) * sharpness, sharpness, sharpness);
    });
  }, [gameData, mapProps]);

  return (
    <canvas
      height={mapHeight * sharpness}
      width={mapWidth * sharpness}
      className="border-2 border-black w-[100vmin] h-[100vmin]"
      id="canvasMap"
    >
      MapComponent
    </canvas>
  );
};

export default MapComponent;
