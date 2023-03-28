import TestMapComponent from "./TestMapComponent";
import ControlerComponent from "./ControlerComponent";
import { useStore } from "@nanostores/react";
import { gameDataStore } from "../store/stores";

const AppComponent = () => {
  const gameData = useStore(gameDataStore);

  return (
    <div className="min-h-screen flex items-center justify-evenly flex-wrap">
      {gameData.isFetching ? (
        <div className="border-2 border-black bg-[green] w-[80vmin] h-[80vmin] flex items-center justify-center">
          <span id="testId" className="text-xl font-bold animate-pulse">
            Generating ...
          </span>
        </div>
      ) : (
        <TestMapComponent />
      )}
      <ControlerComponent />
    </div>
  );
};

export default AppComponent;
