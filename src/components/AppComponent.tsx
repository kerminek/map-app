import React, { useEffect, useMemo, useState } from "react";
import MapComponent from "./MapComponent";
import { calcRealDistance } from "../utils/calcRealDistance";
import TileNode from "../utils/TileNode";
import TestMapComponent from "./TestMapComponent";

type Props = {};
const mapWidth = 200;
const mapHeight = 200;
// const seed = "test";
// const start = 23;
// const end = 356;
let t0: number;
let t1: number;

const AppComponent = (props: Props) => {
  const [seed, seedSet] = useState<number | string>(Math.random().toString());
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
      mainThread.postMessage({ message: "mapGen", payload: { mapWidth, mapHeight, seed } });

      mainThread.onmessage = (mainThreadMessage) => {
        // console.log(mainThreadMessage.data);
        if (mainThreadMessage.data.message !== "mapGenRes") return;
        // console.time("class recreating");
        let tempArray = [];
        mainThreadMessage.data.payload.mapObject.forEach((item) =>
          tempArray.push(
            new TileNode({
              _gridX: item.gridX,
              _gridY: item.gridY,
              _id: item.id,
              _isPath: item.isPath,
              _isSnow: item.isSnow,
              _isWater: item.isWater,
              _walkable: item.walkable,
            })
          )
        );
        // console.timeEnd("class recreating");
        //
        const threads = [0, 1].map(
          (_) => new Worker(new URL("../utils/subWorkerTest.ts", import.meta.url), { type: "module" })
        );
        let done = 0;
        threads.forEach((thread) => {
          thread.onmessage = (e) => {
            const res = e.data;
            tempArray.forEach((item, index) => {
              if (!item.isWater && res[index].isWater) item.isWater = res[index].isWater;
              if (!item.isSnow && res[index].isSnow) item.isSnow = res[index].isSnow;
              if (!item.walkable && res[index].walkable) item.walkable = res[index].walkable;
            });
            done++;
            console.log(done);

            if (done === 2) {
              t1 = performance.now();
              console.log(`Generating map took: ${t1 - t0} miliseconds.`);
              gameDataSet({ ...mainThreadMessage.data.payload, mapObject: tempArray });
            }
          };
        });
        threads.forEach((thread, index) => {
          thread.postMessage({ mapObject: tempArray, mapWidth, mapHeight, whichProcess: index });
        });
        // t1 = performance.now();
        // console.log(`Generating map took: ${t1 - t0} miliseconds.`);

        // gameDataSet({ ...mainThreadMessage.data.payload, mapObject: tempArray });
      };
      mainThread.onerror = (e) => {
        console.error(e);
      };
    }
  }, []);

  const resetMap = (newSeed?: number | string) => {
    t0 = performance.now();
    newSeed && newSeed !== seed && gameDataSet((prev) => ({ ...prev, isFetching: true }));
    console.clear();

    newSeed && seedSet(newSeed);

    mainThread.postMessage({ message: "mapGen", payload: { mapWidth, mapHeight, seed: newSeed } });
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
            resetMap(seed);
          }}
        >
          Load
        </button>
      </div>
      <div className="">
        <button className="bg-slate-300 font-bold py-2 px-6 rounded" onClick={callCalc} disabled={gameData.isFetching}>
          Calculate Path
        </button>
        <button
          className="bg-slate-300 font-bold py-2 px-6 rounded"
          onClick={() => resetMap(seed)}
          disabled={gameData.isFetching}
        >
          Reset Position
        </button>
        <button
          className="bg-slate-300 font-bold py-2 px-6 rounded"
          onClick={() => {
            resetMap(Math.random().toString());
          }}
          disabled={gameData.isFetching}
        >
          Generate New Map
        </button>
      </div>
    </div>
  );
};

export default AppComponent;
