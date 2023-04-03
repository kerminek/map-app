import { useStore } from "@nanostores/react";
import { gameDataStore } from "../store/stores";

const CustomButton = ({ onClick, styles = "", children }) => {
  const gameData = useStore(gameDataStore);

  return (
    <button
      className={`bg-[green] text-orange-500 font-bold rounded-lg flex-1 whitespace-nowrap py-2 px-5 ${styles}`}
      disabled={gameData.isFetching}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
