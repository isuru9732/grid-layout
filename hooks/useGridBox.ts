import { useState, useCallback } from "react";
import type { IGridBox, IPosition, ISize, IGridConfig } from "@/types";
import { GridCalculator } from "@/utils/gridCalculations";

interface UseGridBoxReturn {
  boxes: IGridBox[];
  selectedBoxId: string | null;
  selectBox: (id: string) => void;
  deselectBox: (
    id: string,
    position: IPosition,
    size: ISize,
    containerWidth: number
  ) => void;
  updateBoxPosition: (
    id: string,
    position: IPosition,
    containerWidth: number
  ) => void;
  updateBoxSize: (id: string, size: ISize, containerWidth: number) => void;
  addBox: (box: Omit<IGridBox, "isSelected">) => void;
}

const useGridBox = (
  initialBoxes: Omit<IGridBox, "isSelected">[],
  config: IGridConfig
): UseGridBoxReturn => {
  // All boxes with isSelected flag added
  const [boxes, setBoxes] = useState<IGridBox[]>(
    initialBoxes.map((box) => ({ ...box, isSelected: false }))
  );

  // Currently selected box ID (only one can be selected at a time)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  /**
   * Select a box - only one box can be selected at a time
   */
  const selectBox = useCallback((id: string) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === id) {
          return { ...box, isSelected: true };
        } else if (box.isSelected) {
          // Deselect other boxes
          return { ...box, isSelected: false, absolutePosition: undefined };
        }
        return box;
      })
    );
    setSelectedBoxId(id);
  }, []);

  /**
   * Deselect a box and snap it back to the grid
   *
   * This converts the absolute pixel position back to grid coordinates
   * Example: position (215px, 110px) might become column 2, row 1
   */
  const deselectBox = useCallback(
    (id: string, position: IPosition, size: ISize, containerWidth: number) => {
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) => {
          if (box.id === id) {
            const calculator = new GridCalculator(config, containerWidth);

            // Convert pixel position to grid position
            const newGridPosition = calculator.getGridPosition(position, size);

            // Make sure it's valid (within grid boundaries)
            if (calculator.isValidGridPosition(newGridPosition)) {
              return {
                ...box,
                isSelected: false,
                gridPosition: newGridPosition,
                absolutePosition: undefined,
              };
            }

            // If invalid, keep current grid position
            return { ...box, isSelected: false, absolutePosition: undefined };
          }
          return box;
        })
      );
      setSelectedBoxId(null);
    },
    [config]
  );

  /**
   * Update box position during drag
   *
   * If this is the first movement, initialize absolutePosition with
   * the current size from grid position. This prevents shrinking.
   */
  const updateBoxPosition = useCallback(
    (id: string, position: IPosition, containerWidth: number) => {
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) => {
          if (box.id === id) {
            // First time moving - need to set initial size
            if (!box.absolutePosition) {
              const calculator = new GridCalculator(config, containerWidth);
              const size = calculator.getBoxSize(box.gridPosition);

              return {
                ...box,
                absolutePosition: {
                  ...position,
                  width: size.width,
                  height: size.height,
                },
              };
            }

            // Already has absolute position - just update x, y
            return {
              ...box,
              absolutePosition: {
                ...position,
                width: box.absolutePosition.width,
                height: box.absolutePosition.height,
              },
            };
          }
          return box;
        })
      );
    },
    [config]
  );

  /**
   * Update box size during resize
   *
   * If this is the first resize, initialize absolutePosition with
   * the current position from grid. This prevents jumping.
   */
  const updateBoxSize = useCallback(
    (id: string, size: ISize, containerWidth: number) => {
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) => {
          if (box.id === id) {
            // First time resizing - need to set initial position
            if (!box.absolutePosition) {
              const calculator = new GridCalculator(config, containerWidth);
              const position = calculator.getAbsolutePosition(box.gridPosition);

              return {
                ...box,
                absolutePosition: {
                  x: position.x,
                  y: position.y,
                  ...size,
                },
              };
            }

            // Already has absolute position - just update width, height
            return {
              ...box,
              absolutePosition: {
                ...box.absolutePosition,
                ...size,
              },
            };
          }
          return box;
        })
      );
    },
    [config]
  );

  /**
   * Add a new box to the grid
   */
  const addBox = useCallback((box: Omit<IGridBox, "isSelected">) => {
    setBoxes((prevBoxes) => [...prevBoxes, { ...box, isSelected: false }]);
  }, []);

  return {
    boxes,
    selectedBoxId,
    selectBox,
    deselectBox,
    updateBoxPosition,
    updateBoxSize,
    addBox,
  };
};

export default useGridBox;
