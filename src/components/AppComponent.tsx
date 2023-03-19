import React, { useEffect, useMemo, useState } from "react";
import MapComponent from "./MapComponent";
import { calcRealDistance } from "../utils/calcRealDistance";
import TileNode from "../utils/TileNode";
import TestMapComponent from "./TestMapComponent";
import { generateFreeTileId } from "../utils/generateMap";
import resetMap from "../utils/resetMap";
import handleMapGenRes from "../utils/handleMapGenRes";

type Props = {};
const mapWidth = 200;
const mapHeight = 200;
let t0: number;
let t1: number;

// const startingSeed = Math.random().toString();
const startingSeed = "0.8965647813329204";
let multithread = true;

const AppComponent = (props: Props) => {
  const [loadingTime, loadingTimeSet] = useState<number>(null);
  const [seed, seedSet] = useState<string>(startingSeed);
  const [cachedMap, cachedMapSet] = useState({
    seed: startingSeed,
    mapObject: [],
  });
  const [gameData, gameDataSet] = useState<{ start: number; end: number; mapObject: TileNode[]; isFetching: boolean }>({
    start: undefined,
    end: undefined,
    mapObject: [],
    isFetching: true,
  });

  const mainThread: Worker = useMemo(
    () => new Worker(new URL("../utils/test.ts", import.meta.url), { type: "module" }),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      t0 = performance.now();
      mainThread.postMessage({ message: "mapGen", payload: { mapWidth, mapHeight, seed, multithread } });

      mainThread.onmessage = (mainThreadMessage) => {
        if (mainThreadMessage.data.message !== "mapGenRes") return;
        handleMapGenRes({
          mainThreadMessage,
          multithread,
          t0,
          t1,
          mapHeight,
          mapWidth,
          loadingTimeSet,
          cachedMapSet,
          gameDataSet,
        });
      };
      mainThread.onerror = (e) => {
        console.error(e);
      };
    }
  }, []);

  const handleMapReset = (newSeed = seed) => {
    console.clear();
    t0 = performance.now();
    resetMap({ newSeed, mapHeight, mapWidth, cachedMap, cachedMapSet, gameDataSet, seedSet, mainThread, multithread });
    t1 = performance.now();
    console.log(`Generating map took: ${t1 - t0} miliseconds.`);
  };

  const callCalc = () => {
    calcRealDistance({ gameData, gameDataSet, mapHeight, mapWidth });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10">
      {gameData.isFetching ? (
        <div
          className="bg-neutral-500 border-2 border-black flex items-center justify-center"
          style={{ height: mapHeight * 4 + "px", width: mapWidth * 4 + "px" }}
        >
          Generating...
        </div>
      ) : (
        // <MapComponent gameData={gameData} mapHeight={mapHeight} mapWidth={mapWidth} />
        <TestMapComponent gameData={gameData} mapHeight={mapHeight} mapWidth={mapWidth} />
      )}
      <div className="flex items-center gap-2">
        <p className="font-semibold italic">Seed:</p>
        <input className="bg-transparent outline-none" value={seed} onChange={(e) => seedSet(e.currentTarget.value)} />
        <button
          className="bg-slate-300 font-bold py-1 px-4 rounded"
          onClick={() => {
            handleMapReset(seed);
          }}
        >
          Load
        </button>
      </div>
      <div>Generating took: {loadingTime && loadingTime.toFixed() + " ms"}</div>
      <div className="">
        <button className="bg-slate-300 font-bold py-2 px-6 rounded" onClick={callCalc} disabled={gameData.isFetching}>
          Calculate Path
        </button>
        <button
          className="bg-slate-300 font-bold py-2 px-6 rounded"
          onClick={() => handleMapReset(seed)}
          disabled={gameData.isFetching}
        >
          Reset Position
        </button>
        <button
          className="bg-slate-300 font-bold py-2 px-6 rounded"
          onClick={() => {
            handleMapReset(Math.random().toString());
          }}
          disabled={gameData.isFetching}
        >
          Generate New Map
        </button>
        <button onClick={() => (multithread = !multithread)}>Threading</button>
      </div>
    </div>
  );
};

export default AppComponent;
