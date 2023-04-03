import { useStore } from "@nanostores/react";
import { gameDataStore, mapPropsStore } from "../store/stores";
import CustomButton from "./customButton";
import resetMap from "../utils/resetMap";
import labeledInputTypes from "../utils/labeledInputTypes";

export type labeledInputType = "seed" | "size" | "fill" | "smooth" | "sharp" | "multithread";
type Props = {
  type: labeledInputType;
};

const LabeledInput = (props: Props) => {
  const mapProps = useStore(mapPropsStore);
  const gameData = useStore(gameDataStore);

  let { seed } = mapProps;

  const { htmlFor, labelName, value, checked, onChange, type, min, max, step, styling, maxLength, spellCheck } =
    labeledInputTypes(props.type);

  return (
    <div className="flex items-center bg-[green] rounded-lg pl-2 mb-2">
      <label className="font-bold italic cursor-pointer" htmlFor={htmlFor}>
        {labelName}:
      </label>
      <input
        disabled={gameData.isFetching}
        className={styling}
        value={value}
        checked={checked}
        onChange={onChange}
        id={htmlFor}
        type={type}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        spellCheck={spellCheck}
      />
      {props.type === "seed" && (
        <CustomButton onClick={() => resetMap(seed)} styles="my-0 mx-0 px-3 h-full">
          Load
        </CustomButton>
      )}
    </div>
  );
};

export default LabeledInput;
