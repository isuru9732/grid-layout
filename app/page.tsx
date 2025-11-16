"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import GridContainer from "@/components/GridContainer";
import type { IGridBox } from "@/types";

// Initial boxes
const initialBoxes: Omit<IGridBox, "isSelected">[] = [
  {
    id: "box-1",
    gridPosition: { column: 0, row: 0, columnSpan: 2, rowSpan: 1 },
    color: "#FF6B6B",
  },
  {
    id: "box-2",
    gridPosition: { column: 2, row: 0, columnSpan: 3, rowSpan: 2 },
    color: "#4ECDC4",
  },
  {
    id: "box-3",
    gridPosition: { column: 5, row: 0, columnSpan: 2, rowSpan: 1 },
    color: "#45B7D1",
  },
  {
    id: "box-4",
    gridPosition: { column: 0, row: 1, columnSpan: 2, rowSpan: 2 },
    color: "#FFA07A",
  },
  {
    id: "box-5",
    gridPosition: { column: 7, row: 0, columnSpan: 3, rowSpan: 1 },
    color: "#98D8C8",
  },
  {
    id: "box-6",
    gridPosition: { column: 5, row: 1, columnSpan: 2, rowSpan: 1 },
    color: "#F7DC6F",
  },
];

export default function HomePage() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa", py: 4 }}>
      <Container maxWidth="xl">
        <GridContainer initialBoxes={initialBoxes} />
      </Container>
    </Box>
  );
}
