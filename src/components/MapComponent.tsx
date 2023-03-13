import TileNode from "../utils/TileNode";

type Props = {
  gameData: {
    start: number;
    end: number;
    mapObject: TileNode[];
  };
  mapHeight: number;
  mapWidth: number;
};

const MapComponent = (props: Props) => {
  const { gameData, mapHeight, mapWidth } = props;

  return (
    <div
      className="grid text-center border-2 border-black"
      style={{ gridTemplateColumns: `repeat(${mapHeight}, minmax(0, 1fr))` }}
    >
      {gameData.mapObject.map((item, key) => (
        <div
          className={`h-1 w-1
            ${
              (item.id === gameData.start && "bg-red-500 animate-pulse") ||
              (item.id === gameData.end && "bg-cyan-400 animate-pulse") ||
              (item.isSnow && "bg-neutral-100") ||
              (item.isWater && "bg-sky-600") ||
              (!item.walkable && "bg-stone-400") ||
              (item.isPath && "bg-orange-500") ||
              // @ts-expect-error
              (item.wasCalc && "bg-red-800") ||
              "bg-green-700/75"
            }
            `}
          key={item.id}
          // onClick={() => console.log(item)}
        />
      ))}
    </div>
  );
};

export default MapComponent;
