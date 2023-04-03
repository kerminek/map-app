import { generateFreeTileId, processRegions } from "./generateMap";

self.onmessage = (e: MessageEvent) => {
  let tempArray = e.data.mapObject;

  processRegions(tempArray, e.data.mapWidth, e.data.mapHeight);

  const start = generateFreeTileId(tempArray);
  const end = generateFreeTileId(tempArray);

  self.postMessage({ mapObject: tempArray, start, end });
};
