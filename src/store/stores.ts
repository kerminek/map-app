import { atom } from "nanostores";

const startingSeed = Math.random().toFixed(16);

export const mapPropsStore = atom({
  seed: startingSeed,
  mapHeight: 100,
  mapWidth: 100,
  randomFillPercent: 0.49,
  smoothingNumber: 5,
  sharpness: 5,
  multithread: true,
});

export const gameDataStore = atom({
  start: undefined,
  end: undefined,
  mapObject: [],
  isFetching: true,
});

export const cachedMapStore = atom({
  seed: mapPropsStore.get().seed,
  mapObject: [],
});

export const loadingTimeStore = atom({ t0: null, t1: null });

export const mainThreadStore = atom(new Worker(new URL("../utils/startGen.ts", import.meta.url), { type: "module" }));
