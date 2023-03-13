export default function randomNum(mapSize: number) {
  return Math.max(Math.trunc(Math.random() * mapSize), 1);
}
