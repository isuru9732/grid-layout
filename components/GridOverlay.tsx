"use client";

import { Box } from "@mui/material";
import type { IGridConfig } from "@/types";

interface GridOverlayProps {
  config: IGridConfig;
  containerWidth: number;
  rows: number;
}

const GridOverlay = ({ config, containerWidth, rows }: GridOverlayProps) => {
  const { columns, columnGap, rowGap, cellHeight } = config;

  // Calculate cell width based on container width
  const totalGaps = columnGap * (columns - 1);
  const cellWidth = (containerWidth - totalGaps) / columns;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // Don't interfere with box interactions
        zIndex: 0,
      }}
    >
      {/* Render grid cells */}
      {Array.from({ length: rows }).map((_, rowIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => {
          const x = colIndex * (cellWidth + columnGap);
          const y = rowIndex * (cellHeight + rowGap);

          return (
            <Box
              key={`cell-${rowIndex}-${colIndex}`}
              sx={{
                position: "absolute",
                left: x,
                top: y,
                width: cellWidth,
                height: cellHeight,
                border: "1px dashed rgba(0, 0, 0, 0.1)",
                backgroundColor: "rgba(0, 0, 0, 0.01)",
              }}
            />
          );
        })
      )}
    </Box>
  );
};

export default GridOverlay;
