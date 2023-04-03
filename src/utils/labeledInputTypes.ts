import { labeledInputType } from "../components/labeledInput";
import { mapPropsStore } from "../store/stores";

const labeledInputTypes = (labeledInputType: labeledInputType) => {
  const mapProps = mapPropsStore.get();

  let { seed, mapWidth, randomFillPercent, smoothingNumber, sharpness, multithread } = mapProps;

  const labeledInputTypes = {
    seed: {
      labelName: "Seed",
      htmlFor: "seedInput",
      styling:
        "bg-transparent outline-none pl-1 max-w-[180px] w-full h-full font-semibold caret-orange-500 text-orange-500",
      value: seed,
      checked: undefined,
      onChange: (e) => mapPropsStore.set({ ...mapProps, seed: e.target.value }),
      type: "text",
      inputMode: "text",
      spellCheck: "false",
      maxLength: 18,
      min: undefined,
      max: undefined,
      step: undefined,
    },
    size: {
      labelName: "Size",
      htmlFor: "sizeInput",
      styling:
        "bg-transparent outline-none pl-1 max-w-[100px] w-18 h-full font-semibold caret-orange-500 text-orange-500",
      value: mapWidth,
      checked: undefined,
      onChange: (e) =>
        mapPropsStore.set({ ...mapProps, mapWidth: e.target.valueAsNumber, mapHeight: e.target.valueAsNumber }),
      type: "number",
      min: 1,
      max: 1000,
      step: undefined,
      spellCheck: undefined,
      maxLength: undefined,
    },
    fill: {
      labelName: "Fill",
      htmlFor: "fillInput",
      styling:
        "bg-transparent outline-none pl-1 max-w-[100px] w-18 h-full font-semibold caret-orange-500 text-orange-500",
      value: randomFillPercent,
      checked: undefined,
      onChange: (e) => mapPropsStore.set({ ...mapProps, randomFillPercent: e.target.valueAsNumber }),
      type: "number",
      min: 0,
      max: 1,
      step: 0.005,
      spellCheck: undefined,
      maxLength: undefined,
    },
    smooth: {
      labelName: "Smooth",
      htmlFor: "smoothInput",
      styling:
        "bg-transparent outline-none pl-1 max-w-[100px] w-18 h-full font-semibold caret-orange-500 text-orange-500",
      value: smoothingNumber,
      checked: undefined,
      onChange: (e) => mapPropsStore.set({ ...mapProps, smoothingNumber: e.target.valueAsNumber }),
      type: "number",
      min: 0,
      max: 100,
      step: 1,
      spellCheck: undefined,
      maxLength: undefined,
    },
    sharp: {
      labelName: "Sharp",
      htmlFor: "sharpInput",
      styling:
        "bg-transparent outline-none pl-1 max-w-[100px] w-18 h-full font-semibold caret-orange-500 text-orange-500",
      value: sharpness,
      checked: undefined,
      onChange: (e) => mapPropsStore.set({ ...mapProps, sharpness: e.target.valueAsNumber }),
      type: "number",
      min: 1,
      max: 100,
      step: 1,
      spellCheck: undefined,
      maxLength: undefined,
    },
    multithread: {
      labelName: "Multithread",
      htmlFor: "threadingInput",
      styling: "bg-transparent outline-none h-full mx-2",
      value: undefined,
      checked: multithread,
      onChange: (e) => mapPropsStore.set({ ...mapProps, multithread: e.target.checked }),
      type: "checkbox",
      min: undefined,
      max: undefined,
      step: undefined,
      spellCheck: undefined,
      maxLength: undefined,
    },
  };

  return labeledInputTypes[labeledInputType];
};

export default labeledInputTypes;
