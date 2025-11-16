"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GridOverlay from "./GridOverlay";
import useGridBox from "@/hooks/useGridBox";
import {
  DEFAULT_GRID_CONFIG,
  generateRandomColor,
  generateId,
} from "@/utils/gridCalculations";
import type {
  IGridConfig,
  IGridContainerProps,
  IPosition,
  ISize,
} from "@/types";
import GridBox from "./GridBox";

const GridContainer = ({ initialBoxes = [] }: IGridContainerProps) => {
  // Merge custom config with defaults
  const config: IGridConfig = { ...DEFAULT_GRID_CONFIG };

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rows, setRows] = useState(5);

  // Get box management functions from custom hook
  const {
    boxes,
    selectedBoxId,
    selectBox,
    deselectBox,
    updateBoxPosition,
    updateBoxSize,
    addBox,
  } = useGridBox(initialBoxes, config);

  // Measure container width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate how many rows we need based on boxes
  useEffect(() => {
    const maxRow = boxes.reduce((max, box) => {
      return Math.max(max, box.gridPosition.row + box.gridPosition.rowSpan);
    }, 5);
    setRows(Math.max(5, maxRow + 2)); // +2 for extra space
  }, [boxes]);

  // Wrapper for deselect - injects containerWidth
  const handleDeselect = useCallback(
    (id: string, position: IPosition, size: ISize) => {
      if (containerRef.current) {
        deselectBox(id, position, size, containerRef.current.offsetWidth);
      }
    },
    [deselectBox]
  );

  // Wrapper for position update - injects containerWidth
  const handlePositionUpdate = useCallback(
    (id: string, position: IPosition) => {
      if (containerRef.current) {
        updateBoxPosition(id, position, containerRef.current.offsetWidth);
      }
    },
    [updateBoxPosition]
  );

  // Wrapper for size update - injects containerWidth
  const handleSizeUpdate = useCallback(
    (id: string, size: ISize) => {
      if (containerRef.current) {
        updateBoxSize(id, size, containerRef.current.offsetWidth);
      }
    },
    [updateBoxSize]
  );

  // Add a new box to the grid
  const handleAddBox = useCallback(() => {
    // Find first empty position
    const existingPositions = new Set(
      boxes.map((box) => `${box.gridPosition.row}-${box.gridPosition.column}`)
    );

    let newRow = 0;
    let newCol = 0;
    let found = false;

    for (let r = 0; r < rows && !found; r++) {
      for (let c = 0; c < config.columns && !found; c++) {
        if (!existingPositions.has(`${r}-${c}`)) {
          newRow = r;
          newCol = c;
          found = true;
        }
      }
    }

    const newBox = {
      id: generateId(),
      gridPosition: {
        column: newCol,
        row: newRow,
        columnSpan: 2,
        rowSpan: 1,
      },
      color: generateRandomColor(),
    };

    addBox(newBox);
  }, [boxes, rows, config.columns, addBox]);

  const containerHeight = rows * config.cellHeight + (rows - 1) * config.rowGap;

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      {/* Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBox}
          sx={{ textTransform: "none" }}
        >
          Add Box
        </Button>
        <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
          {boxes.length} box{boxes.length !== 1 ? "es" : ""} •{" "}
          {selectedBoxId ? "Box selected" : "Click to select"}
        </Box>
      </Box>

      {/* Grid Container */}
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          minHeight: containerHeight,
          backgroundColor: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            width: "100%",
            height: containerHeight,
          }}
        >
          {/* Grid background overlay */}
          {containerWidth > 0 && (
            <GridOverlay
              config={config}
              containerWidth={containerWidth}
              rows={rows}
            />
          )}

          {/* Render all boxes */}
          {boxes.map((box) => (
            <GridBox
              key={box.id}
              box={box}
              config={config}
              onSelect={selectBox}
              onDeselect={handleDeselect}
              onDrag={handlePositionUpdate}
              onResize={handleSizeUpdate}
              containerRef={containerRef}
              containerWidth={containerWidth}
            />
          ))}
        </Box>
      </Paper>

      {/* Instructions */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
        <Box sx={{ fontWeight: "bold", mb: 1 }}>Instructions:</Box>
        <Box component="ul" sx={{ m: 0, pl: 3 }}>
          <li>Click a box to select it</li>
          <li>Drag anywhere on a selected box to move it</li>
          <li>Drag the corner handle to resize a selected box</li>
          <li>Click outside the box to deselect and snap to grid</li>
          <li>Add new boxes using the "Add Box" button</li>
        </Box>
      </Box>
    </Box>
  );
};
export default GridContainer;
