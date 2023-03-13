const calcPosition = (tileNum: number, mapWidth: number) => {
  let col = tileNum % mapWidth;
  if (col === 0) col = mapWidth;
  const row = Math.ceil(tileNum / mapWidth);

  return { col, row };
};

export default calcPosition;
