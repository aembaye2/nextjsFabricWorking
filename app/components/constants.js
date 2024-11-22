import { fabric } from "fabric";

// Export a function to create the rectangle
export const rect2 = (canvasWidth, canvasHeight) => {
  return new fabric.Rect({
    left: 75,
    top: 25,
    fill: "white",
    width: canvasWidth - 100,
    height: canvasHeight - 100,
    stroke: "black",
    strokeWidth: 1,
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    hasControls: false,
  });
};
