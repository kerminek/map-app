/// <reference types="astro/client" />

type singleTile = {
  id: number;
  col?: number;
  row?: number;
  isStart?: boolean;
  isEnd?: boolean;
  isBlockade?: boolean;
  isPath?: boolean;
  distance?: number;
  value?: number;
  totalPathCost?: number;
  parent?: singleTile;
  heapIndex?: number;
};
