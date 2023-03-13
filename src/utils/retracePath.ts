import TileNode from "./TileNode";

const retracePath = (startNode: TileNode, endNode: TileNode) => {
  let path: TileNode[] = [];
  let currentNode = endNode;

  while (currentNode != startNode) {
    currentNode.isPath = true;

    path.push(currentNode);
    currentNode = currentNode.parent;
  }
  path.reverse();

  return path;
};

export default retracePath;
