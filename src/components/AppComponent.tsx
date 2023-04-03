import MapComponent from "./MapComponent";
import ControlerComponent from "./ControlerComponent";
import { useStore } from "@nanostores/react";
import { gameDataStore } from "../store/stores";

const AppComponent = () => {
  const gameData = useStore(gameDataStore);

  return (
    <div className="flex content-start justify-center flex-wrap gap-4">
      {gameData.isFetching ? (
        <div className="border-2 border-black bg-[green] w-[100vmin] h-[100vmin] flex items-center justify-center">
          <span id="testId" className="text-xl font-bold animate-pulse">
            Generating ...
          </span>
        </div>
      ) : (
        <MapComponent />
      )}
      <ControlerComponent />
    </div>
  );
};

export default AppComponent;
