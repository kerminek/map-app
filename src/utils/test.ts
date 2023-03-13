// @ts-nocheck
self.onmessage = (e: MessageEvent) => {
  if (e.data.message === "mapGen") {
    let payload = generateMap(e.data.payload);
    const res = {
      message: "mapGenRes",
      isFetching: false,
      payload,
    };
    self.postMessage(res);
  }
};

// // // generateMap
const randomFillPercent = 0.495;
const smoothingNumber = 5;

interface cachedMap {
  seed: string | number;
  mapObject: TileNode[];
}
let cachedMap: cachedMap = {
  seed: undefined,
  mapObject: [],
};

const generateMap = ({
  mapWidth = 30,
  mapHeight = 30,
  seed,
}: {
  mapWidth?: number;
  mapHeight?: number;
  seed?: string | number;
}) => {
  console.time("generating map");
  if (seed === cachedMap.seed) {
    cachedMap.mapObject = cachedMap.mapObject.map((cachedTileNode: TileNode) => {
      const {
        gridX: _gridX,
        gridY: _gridY,
        id: _id,
        walkable: _walkable,
        isSnow: _isSnow,
        isWater: _isWater,
      } = cachedTileNode;
      return (cachedTileNode = new TileNode({ _gridX, _gridY, _id, _walkable, _isSnow, _isWater, _isPath: false }));
    });
    console.timeEnd("generating map");
    return {
      start: generateFreeTileId(cachedMap.mapObject),
      end: generateFreeTileId(cachedMap.mapObject),
      mapObject: cachedMap.mapObject,
    };
  }
  let mapObject: TileNode[] = [];
  // @ts-ignore
  const myrng1 = new Math.seedrandom(seed);

  for (let i = 1; i <= mapWidth * mapHeight; i++) {
    const { col: _gridX, row: _gridY } = calcPosition(i, mapWidth);
    const newTileNode = new TileNode({ _gridX, _gridY, _id: i });
    if (myrng1.quick() < randomFillPercent) newTileNode.walkable = false;
    mapObject.push(newTileNode);
  }

  mapSmoothing(mapObject, smoothingNumber, { mapHeight, mapWidth });

  processRegions(mapObject, mapWidth, mapHeight);
  //
  let start = generateFreeTileId(mapObject);
  let end = generateFreeTileId(mapObject);

  console.timeEnd("generating map");
  cachedMap = {
    seed,
    mapObject,
  };

  return { start, end, mapObject };
};

const generateFreeTileId = (mapObject: TileNode[]) => {
  let randomTileId = randomNum(mapObject.length);

  while (!mapObject[randomTileId - 1].walkable) {
    randomTileId = randomNum(mapObject.length);
  }

  return randomTileId;
};

const mapSmoothing = (
  mapObject: TileNode[],
  howManyTimes: number,
  mapDimensions: { mapWidth: number; mapHeight: number }
) => {
  const { mapWidth, mapHeight } = mapDimensions;
  while (howManyTimes > 0) {
    howManyTimes--;
    let copiedMapObject = [...mapObject];
    copiedMapObject.forEach((currentTile) => {
      let neighbourWallTiles = 0;
      let neighbours = copiedMapObject
        .slice(
          Math.max(currentTile.id - (mapWidth + 2), 0),
          Math.min(currentTile.id + (mapWidth + 1), mapHeight * mapWidth)
        )
        .filter((item) => neighboursConditions(currentTile, item, false));

      neighbours.forEach((neighbour) => {
        if (neighbour.walkable === false) neighbourWallTiles++;
      });

      if (neighbourWallTiles > 4) {
        currentTile.walkable = false;
      } else if (neighbourWallTiles < 4) {
        currentTile.walkable = true;
      }
    });
    mapObject = copiedMapObject;
  }
};

const getRegionTiles = (tileNode: TileNode, mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  let tiles: TileNode[] = [];
  const mapFlags: Set<TileNode> = new Set();

  let queue: TileNode[] = [];
  queue.splice(0, 0, tileNode);
  mapFlags.add(tileNode);

  while (queue.length > 0) {
    const currentTile = queue.pop();
    tiles.push(currentTile);

    let copiedMapObject = [...mapObject];
    let neighbours = copiedMapObject
      .slice(
        Math.max(currentTile.id - (mapWidth + 2), 0),
        Math.min(currentTile.id + (mapWidth + 1), mapHeight * mapWidth)
      )
      .filter((item) => neighboursConditions(currentTile, item, false, true));

    neighbours.forEach((neighbour) => {
      if (!mapFlags.has(neighbour) && Boolean(neighbour.walkable) === currentTile.walkable) {
        mapFlags.add(neighbour);
        queue.splice(0, 0, neighbour);
      }
    });
  }

  return tiles;
};

const getRegions = (isWalkable: boolean, mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  const tileType = isWalkable;
  let regions: TileNode[][] = [];
  const mapFlags: Set<TileNode> = new Set();

  mapObject.forEach((tileNode) => {
    if (!mapFlags.has(tileNode) && tileNode.walkable === tileType) {
      const newRegion = getRegionTiles(tileNode, mapObject, mapWidth, mapHeight);
      regions.push(newRegion);

      newRegion.forEach((region) => mapFlags.add(region));
    }
  });

  return regions;
};

const processRegions = (mapObject: TileNode[], mapWidth: number, mapHeight: number) => {
  let whichRegion = false;
  const wallRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
  const wallThreshold = mapWidth / 2;
  const secondWallThreshold = wallThreshold * 4;

  wallRegions.forEach((region) => {
    if (region.length < wallThreshold) {
      region.forEach((tileNode) => {
        tileNode.walkable = true;
      });
    } else if (region.length < secondWallThreshold) {
      region.forEach((tileNode) => {
        tileNode.isWater = true;
        tileNode.walkable = false;
      });
    }
  });

  //
  whichRegion = true;
  const freeRegions = getRegions(whichRegion, mapObject, mapWidth, mapHeight);
  const freeThreshold = Math.max(5, mapWidth / 2);
  const secondFreeThreshold = freeThreshold * 4;

  freeRegions.forEach((region) => {
    if (region.length < freeThreshold) {
      region.forEach((tileNode) => {
        tileNode.walkable = false;
      });
    } else if (region.length < secondFreeThreshold) {
      region.forEach((tileNode) => {
        tileNode.isSnow = true;
        tileNode.walkable = false;
      });
    }
  });
};

// TileNode

class TileNode {
  public walkable: boolean = true;
  public id: number;

  public gridX: number;
  public gridY: number;

  public gCost: number;
  public hCost: number;
  public parent: TileNode;
  heapIndex: number;

  public isPath: boolean = false;
  public isSnow: boolean = false;
  public isWater: boolean = false;

  constructor({
    _gridX,
    _gridY,
    _id,
    _walkable,
    _isPath,
    _isSnow,
    _isWater,
  }: {
    _gridX: number;
    _gridY: number;
    _id: number;
    _walkable?: boolean;
    _isPath?: boolean;
    _isSnow?: boolean;
    _isWater?: boolean;
  }) {
    this.walkable = _walkable;
    this.gridX = _gridX;
    this.gridY = _gridY;
    this.id = _id;

    this.isPath = _isPath;
    this.isSnow = _isSnow;
    this.isWater = _isWater;
  }

  public get fCost() {
    return this.gCost + this.hCost;
  }

  public get HeapIndex() {
    return this.heapIndex;
  }
  public set HeapIndex(value: number) {
    this.heapIndex = value;
  }

  public CompareTo(nodeToCompare: TileNode) {
    let compare: number = Math.sign(this.fCost - nodeToCompare.fCost);
    if (compare == 0) {
      compare = Math.sign(this.hCost - nodeToCompare.hCost);
    }
    return -compare;
  }
}

// calcPos
const calcPosition = (tileNum: number, mapWidth: number) => {
  let col = tileNum % mapWidth;
  if (col === 0) col = mapWidth;
  const row = Math.ceil(tileNum / mapWidth);

  return { col, row };
};

// randomNum
const randomNum = (mapSize: number) => {
  return Math.max(Math.trunc(Math.random() * mapSize), 1);
};

// neighboursConditions
const neighboursConditions = (currentTile: TileNode, item: TileNode, filterWalkable = true, filterDiagonal = false) => {
  if (currentTile.id === item.id) return false;
  if (filterWalkable && !item.walkable) return false;
  if (item.gridX < currentTile.gridX - 1 || item.gridX > currentTile.gridX + 1) return false;
  if (item.gridY < currentTile.gridY - 1 || item.gridY > currentTile.gridY + 1) return false;
  if (filterDiagonal) {
    if (currentTile.gridX === item.gridX || currentTile.gridY === item.gridY) return true;
    return false;
  }
  return true;
};

//

(function (f, a, c) {
  var s,
    l = 256,
    p = "random",
    d = c.pow(l, 6),
    g = c.pow(2, 52),
    y = 2 * g,
    h = l - 1;
  function n(n, t, r) {
    function e() {
      for (var n = u.g(6), t = d, r = 0; n < g; ) (n = (n + r) * l), (t *= l), (r = u.g(1));
      for (; y <= n; ) (n /= 2), (t /= 2), (r >>>= 1);
      return (n + r) / t;
    }
    var o = [],
      i = j(
        (function n(t, r) {
          var e,
            o = [],
            i = typeof t;
          if (r && "object" == i)
            for (e in t)
              try {
                o.push(n(t[e], r - 1));
              } catch (n) {}
          return o.length ? o : "string" == i ? t : t + "\0";
        })(
          (t = 1 == t ? { entropy: !0 } : t || {}).entropy
            ? [n, S(a)]
            : null == n
            ? (function () {
                try {
                  var n;
                  return (
                    s && (n = s.randomBytes)
                      ? (n = n(l))
                      : ((n = new Uint8Array(l)), (f.crypto || f.msCrypto).getRandomValues(n)),
                    S(n)
                  );
                } catch (n) {
                  var t = f.navigator,
                    r = t && t.plugins;
                  return [+new Date(), f, r, f.screen, S(a)];
                }
              })()
            : n,
          3
        ),
        o
      ),
      u = new m(o);
    return (
      (e.int32 = function () {
        return 0 | u.g(4);
      }),
      (e.quick = function () {
        return u.g(4) / 4294967296;
      }),
      (e.double = e),
      j(S(u.S), a),
      (
        t.pass ||
        r ||
        function (n, t, r, e) {
          return (
            e &&
              (e.S && v(e, u),
              (n.state = function () {
                return v(u, {});
              })),
            r ? ((c[p] = n), t) : n
          );
        }
      )(e, i, "global" in t ? t.global : this == c, t.state)
    );
  }
  function m(n) {
    var t,
      r = n.length,
      u = this,
      e = 0,
      o = (u.i = u.j = 0),
      i = (u.S = []);
    for (r || (n = [r++]); e < l; ) i[e] = e++;
    for (e = 0; e < l; e++) (i[e] = i[(o = h & (o + n[e % r] + (t = i[e])))]), (i[o] = t);
    (u.g = function (n) {
      for (var t, r = 0, e = u.i, o = u.j, i = u.S; n--; )
        (t = i[(e = h & (e + 1))]), (r = r * l + i[h & ((i[e] = i[(o = h & (o + t))]) + (i[o] = t))]);
      return (u.i = e), (u.j = o), r;
    })(l);
  }
  function v(n, t) {
    return (t.i = n.i), (t.j = n.j), (t.S = n.S.slice()), t;
  }
  function j(n, t) {
    for (var r, e = n + "", o = 0; o < e.length; ) t[h & o] = h & ((r ^= 19 * t[h & o]) + e.charCodeAt(o++));
    return S(t);
  }
  function S(n) {
    return String.fromCharCode.apply(0, n);
  }
  if ((j(c.random(), a), "object" == typeof module && module.exports)) {
    module.exports = n;
    try {
      s = require("crypto");
    } catch (n) {}
  } else
    "function" == typeof define && define.amd
      ? define(function () {
          return n;
        })
      : (c["seed" + p] = n);
})("undefined" != typeof self ? self : this, [], Math);
