import { atom } from "nanostores";

const startingSeed = Math.random().toString();

export const mapPropsStore = atom({
  seed: startingSeed,
  mapHeight: 200,
  mapWidth: 200,
  randomFillPercent: 0.47,
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
