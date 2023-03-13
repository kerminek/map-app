export default class TileNode {
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
