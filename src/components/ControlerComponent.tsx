import resetMap from "../utils/resetMap";
import { calcRealDistance } from "../utils/calcRealDistance";
import { useStore } from "@nanostores/react";
import { gameDataStore, loadingTimeStore, mapPropsStore } from "../store/stores";
import { handleMainThread } from "../utils/handleMainThread";
import CustomButton from "./customButton";
import LabeledInput from "./labeledInput";

const ControlerComponent = () => {
  const mapProps = useStore(mapPropsStore);
  const loadingTime = useStore(loadingTimeStore);
  const gameData = useStore(gameDataStore);

  let { seed } = mapProps;

  handleMainThread();

  return (
    <div className="flex flex-wrap flex-1 h-min p-4 max-w-[100vmin]">
      <div className="w-full">
        {/* Upper Section */}
        <div className="flex flex-wrap gap-x-10 w-full justify-between">
          <LabeledInput type="seed" />
          <p
            className={`text-xs font-black self-center whitespace-nowrap mb-2 ${
              gameData.isFetching && "animate-pulse"
            }`}
          >
            Generating a map took:{" "}
            <span className="text-orange-500">
              {(loadingTime?.t1 && loadingTime.t1.toFixed() - loadingTime.t0.toFixed()) || "0"}
            </span>{" "}
            ms
          </p>
        </div>
        {/* Middle Section */}
        <div className="flex flex-wrap gap-2 justify-between">
          <LabeledInput type="size" />
          <LabeledInput type="fill" />
          <LabeledInput type="smooth" />
          <LabeledInput type="sharp" />
          <LabeledInput type="multithread" />
        </div>
      </div>
      {/* Bottom Section */}
      <div className="flex flex-wrap gap-2 w-full">
        <CustomButton onClick={calcRealDistance}>Calculate Path</CustomButton>
        <CustomButton onClick={() => resetMap(seed)}>Reset Position</CustomButton>
        <CustomButton onClick={() => resetMap(Math.random().toFixed(16))}>Generate New Map</CustomButton>
      </div>
    </div>
  );
};

export default ControlerComponent;
