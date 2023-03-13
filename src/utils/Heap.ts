import TileNode from "./TileNode";

class Heap<T extends TileNode> {
  items: T[] = [];
  currentItemCount: number = 0;

  constructor(maxHeapSize: number) {
    this.items = new Array<T>(maxHeapSize);
  }
  public Add(item: T): void {
    item.HeapIndex = this.currentItemCount;
    this.items[this.currentItemCount] = item;
    this.SortUp(item);
    this.currentItemCount++;
  }

  public RemoveFirst(): T {
    const firstItem: T = this.items[0];
    this.currentItemCount--;
    this.items[0] = this.items[this.currentItemCount];
    this.items[0].HeapIndex = 0;
    this.SortDown(this.items[0]);
    return firstItem;
  }

  public UpdateItem(item: T): void {
    this.SortUp(item);
  }

  public get Count(): number {
    return this.currentItemCount;
  }

  public Contains(item: T): boolean {
    const check = this.items[item.HeapIndex]?.id - item.id === 0 ? true : false;
    return check;
  }

  SortDown(item: T): void {
    while (true) {
      const childIndexLeft: number = item.HeapIndex * 2 + 1;
      const childIndexRight: number = item.HeapIndex * 2 + 2;
      let swapIndex: number = 0;

      if (childIndexLeft < this.currentItemCount) {
        swapIndex = childIndexLeft;

        if (childIndexRight < this.currentItemCount) {
          if (this.items[childIndexLeft].CompareTo(this.items[childIndexRight]) < 0) {
            swapIndex = childIndexRight;
          }
        }

        if (item.CompareTo(this.items[swapIndex]) < 0) {
          this.Swap(item, this.items[swapIndex]);
        } else {
          return;
        }
      } else {
        return;
      }
    }
  }

  SortUp(item: T): void {
    let parentIndex = Math.floor(Math.abs((item.HeapIndex - 1) / 2));

    while (true) {
      const parentItem: T = this.items[parentIndex];
      if (item.CompareTo(parentItem) > 0) {
        this.Swap(item, parentItem);
      } else {
        break;
      }
      parentIndex = Math.floor(Math.abs((item.HeapIndex - 1) / 2));
    }
  }

  Swap(itemA: T, itemB: T): void {
    this.items[itemA.HeapIndex] = itemB;
    this.items[itemB.HeapIndex] = itemA;
    const itemAIndex: number = itemA.HeapIndex;
    itemA.HeapIndex = itemB.HeapIndex;
    itemB.HeapIndex = itemAIndex;
  }
}
export default Heap;

interface IHeapItem<T> {
  get HeapIndex(): number;
  set HeapIndex(value: number);
  CompareTo(nodeToCompare: T): number;
  id: number;
}

export type HeapType = InstanceType<typeof Heap>;
