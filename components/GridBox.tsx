"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import type { IGridBoxProps, IPosition, ISize } from "@/types";
import { GridCalculator } from "@/utils/gridCalculations";

const GridBox = ({
  box,
  config,
  onSelect,
  onDeselect,
  onDrag,
  onResize,
  containerRef,
  containerWidth,
}: IGridBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Store initial mouse and box positions when drag/resize starts
  const dragStartPos = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const resizeStartData = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  // Calculate where the box should be rendered
  const getBoxStyle = useCallback(() => {
    if (!containerRef.current) return {};

    const calculator = new GridCalculator(config, containerWidth);

    // If selected and moved/resized, use absolute pixel positioning
    if (box.isSelected && box.absolutePosition) {
      return {
        position: "absolute" as const,
        left: box.absolutePosition.x,
        top: box.absolutePosition.y,
        width: box.absolutePosition.width,
        height: box.absolutePosition.height,
      };
    }

    // Otherwise, calculate position from grid coordinates
    const { position, size } = calculator.getAbsoluteBounds(box.gridPosition);
    return {
      position: "absolute" as const,
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
    };
  }, [box, config, containerRef, containerWidth]);

  // Handle mouse down on box - select or start drag
  const handleBoxMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-resize-handle]")) {
      return;
    }

    if (!box.isSelected) {
      e.stopPropagation();
      onSelect(box.id);
    } else {
      startDrag(e);
    }
  };

  // Start dragging
  const startDrag = (e: React.MouseEvent) => {
    if (!box.isSelected || !containerRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const calculator = new GridCalculator(config, containerWidth);
    const currentBounds = calculator.getAbsoluteBounds(box.gridPosition);

    // Get current position
    const currentX = box.absolutePosition?.x ?? currentBounds.position.x;
    const currentY = box.absolutePosition?.y ?? currentBounds.position.y;

    dragStartPos.current = {
      x: currentX,
      y: currentY,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  const startResize = (e: React.MouseEvent) => {
    if (!box.isSelected || !containerRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const calculator = new GridCalculator(config, containerWidth);
    const currentBounds = calculator.getAbsoluteBounds(box.gridPosition);

    // Get current size
    const currentWidth =
      box.absolutePosition?.width ?? currentBounds.size.width;
    const currentHeight =
      box.absolutePosition?.height ?? currentBounds.size.height;

    // Store starting size
    resizeStartData.current = {
      width: currentWidth,
      height: currentHeight,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  // Handle mouse move during drag or resize
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate how much mouse moved
        const deltaX = e.clientX - dragStartPos.current.mouseX;
        const deltaY = e.clientY - dragStartPos.current.mouseY;

        // Calculate new position
        const newX = Math.max(0, dragStartPos.current.x + deltaX);
        const newY = Math.max(0, dragStartPos.current.y + deltaY);

        onDrag(box.id, { x: newX, y: newY });
      }

      if (isResizing) {
        // Calculate how much mouse moved
        const deltaX = e.clientX - resizeStartData.current.mouseX;
        const deltaY = e.clientY - resizeStartData.current.mouseY;

        // Calculate new size
        const newWidth = Math.max(50, resizeStartData.current.width + deltaX);
        const newHeight = Math.max(50, resizeStartData.current.height + deltaY);

        onResize(box.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, box.id, onDrag, onResize]);

  // Deselect box when clicking outside
  useEffect(() => {
    if (!box.isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        const calculator = new GridCalculator(config, containerWidth);
        const currentBounds = calculator.getAbsoluteBounds(box.gridPosition);

        // Get final position and size
        const position: IPosition = {
          x: box.absolutePosition?.x ?? currentBounds.position.x,
          y: box.absolutePosition?.y ?? currentBounds.position.y,
        };

        const size: ISize = {
          width: box.absolutePosition?.width ?? currentBounds.size.width,
          height: box.absolutePosition?.height ?? currentBounds.size.height,
        };

        onDeselect(box.id, position, size);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [box, config, containerWidth, onDeselect]);

  const boxStyle = getBoxStyle();

  return (
    <Paper
      ref={boxRef}
      elevation={box.isSelected ? 8 : 2}
      onMouseDown={handleBoxMouseDown}
      sx={{
        ...boxStyle,
        backgroundColor: box.color,
        cursor: box.isSelected ? (isDragging ? "grabbing" : "grab") : "pointer",
        transition: box.isSelected ? "none" : "all 0.3s ease",
        border: box.isSelected ? "2px solid #1976d2" : "2px solid transparent",
        overflow: "visible",
        userSelect: "none",
        "&:hover": {
          transform: box.isSelected ? "none" : "scale(1.02)",
          boxShadow: box.isSelected ? undefined : 6,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          }}
        >
          Box {box.id.split("-")[1]}
        </Box>

        {box.isSelected && (
          <Box
            data-resize-handle
            onMouseDown={startResize}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              cursor: "nwse-resize",
              "&::before": {
                content: '""',
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 0,
                height: 0,
                borderStyle: "solid",
                borderWidth: "0 0 12px 12px",
                borderColor:
                  "transparent transparent rgba(0, 0, 0, 0.4) transparent",
              },
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default GridBox;
