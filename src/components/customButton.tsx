import { useStore } from "@nanostores/react";
import { gameDataStore } from "../store/stores";

const CustomButton = ({ onClick, children }) => {
  const gameData = useStore(gameDataStore);

  return (
    <button
      className="bg-slate-300 font-bold py-2 px-5 rounded flex-1 max-w-fit"
      disabled={gameData.isFetching}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
