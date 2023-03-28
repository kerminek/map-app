import { useMemo } from "react";
import resetMap from "../utils/resetMap";
import { calcRealDistance } from "../utils/calcRealDistance";
import { useStore } from "@nanostores/react";
import { gameDataStore, loadingTimeStore, mapPropsStore } from "../store/stores";
import { handleMainThread } from "../utils/handleMainThread";
import CustomButton from "./customButton";

const ControlerComponent = () => {
  const mapProps = useStore(mapPropsStore);
  const gameData = useStore(gameDataStore);
  const loadingTime = useStore(loadingTimeStore);

  let { seed } = mapProps;

  const mainThread: Worker = useMemo(
    () => new Worker(new URL("../utils/startGen.ts", import.meta.url), { type: "module" }),
    []
  );

  handleMainThread(mainThread);

  const handleMapReset = (newSeed = seed) => {
    console.clear();
    resetMap({
      newSeed,
      mainThread,
    });
  };

  return (
    <div className="min-h-[20vmin] border-2 border-black">
      <div className="flex items-center gap-2">
        <p className="font-semibold italic">Seed:</p>
        <input
          className="bg-transparent outline-none"
          value={seed}
          onChange={(e) => mapPropsStore.set({ ...mapProps, seed: e.target.value })}
        />
        <CustomButton
          onClick={() => {
            handleMapReset(seed);
          }}
        >
          Load
        </CustomButton>
      </div>
      <div>Generating took: {loadingTime?.t1 && loadingTime.t1.toFixed() - loadingTime.t0.toFixed() + " ms"}</div>
      <div className="flex flex-wrap">
        <CustomButton onClick={calcRealDistance}>Calculate Path</CustomButton>
        <CustomButton onClick={() => handleMapReset(seed)}>Reset Position</CustomButton>
        <CustomButton
          onClick={() => {
            handleMapReset(Math.random().toString());
          }}
        >
          Generate New Map
        </CustomButton>
        <CustomButton onClick={() => mapPropsStore.set({ ...mapProps, multithread: !mapProps.multithread })}>
          Threading
        </CustomButton>
      </div>
    </div>
  );
};

export default ControlerComponent;
