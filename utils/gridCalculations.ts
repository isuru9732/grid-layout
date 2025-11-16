import type {
  IGridConfig,
  IGridPosition,
  IPosition,
  ISize,
} from "@/types";

export class GridCalculator {
  constructor(private config: IGridConfig, private containerWidth: number) {}

  getCellWidth(): number {
    const { columns, columnGap } = this.config;
    const totalGaps = columnGap * (columns - 1);
    return (this.containerWidth - totalGaps) / columns;
  }

  getCellHeight(): number {
    return this.config.cellHeight;
  }

  getAbsolutePosition(gridPosition: IGridPosition): IPosition {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    const { columnGap, rowGap } = this.config;

    const x = gridPosition.column * (cellWidth + columnGap);
    const y = gridPosition.row * (cellHeight + rowGap);

    return { x, y };
  }

  getGridPosition(position: IPosition, size: ISize): IGridPosition {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    const { columnGap, rowGap } = this.config;

    // Find nearest column and row
    const column = Math.round(position.x / (cellWidth + columnGap));
    const row = Math.round(position.y / (cellHeight + rowGap));

    // Calculate how many cells the box spans
    const columnSpan = Math.max(
      1,
      Math.round(size.width / (cellWidth + columnGap))
    );
    const rowSpan = Math.max(
      1,
      Math.round(size.height / (cellHeight + rowGap))
    );

    // Keep within grid boundaries
    const constrainedColumn = Math.max(
      0,
      Math.min(column, this.config.columns - columnSpan)
    );
    const constrainedRow = Math.max(0, row);

    return {
      column: constrainedColumn,
      row: constrainedRow,
      columnSpan,
      rowSpan,
    };
  }

  /**
   * Snap a pixel position to the nearest grid cell corner
   */
  snapToGrid(position: IPosition): IPosition {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    const { columnGap, rowGap } = this.config;

    const column = Math.round(position.x / (cellWidth + columnGap));
    const row = Math.round(position.y / (cellHeight + rowGap));

    return {
      x: column * (cellWidth + columnGap),
      y: row * (cellHeight + rowGap),
    };
  }

  /**
   * Calculate pixel size from grid span
   *
   * Example: columnSpan 2, rowSpan 1 → width=200px, height=100px
   */
  getBoxSize(gridPosition: IGridPosition): ISize {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    const { columnGap, rowGap } = this.config;

    // ISize = (cells × cellSize) + (gaps between cells)
    const width =
      gridPosition.columnSpan * cellWidth +
      (gridPosition.columnSpan - 1) * columnGap;
    const height =
      gridPosition.rowSpan * cellHeight + (gridPosition.rowSpan - 1) * rowGap;

    return { width, height };
  }

  /**
   * Check if a grid position is valid (within boundaries)
   */
  isValidGridPosition(gridPosition: IGridPosition): boolean {
    return (
      gridPosition.column >= 0 &&
      gridPosition.column + gridPosition.columnSpan <= this.config.columns &&
      gridPosition.row >= 0 &&
      gridPosition.columnSpan > 0 &&
      gridPosition.rowSpan > 0
    );
  }

  /**
   * Get both position and size for a box in one call
   * This is the most commonly used method
   */
  getAbsoluteBounds(gridPosition: IGridPosition): {
    position: IPosition;
    size: ISize;
  } {
    return {
      position: this.getAbsolutePosition(gridPosition),
      size: this.getBoxSize(gridPosition),
    };
  }
}

// default grid
export const DEFAULT_GRID_CONFIG: IGridConfig = {
  columns: 10,
  columnGap: 8,
  rowGap: 8,
  cellHeight: 100,
};

// random colors for box
export function generateRandomColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// generate id for the box
export function generateId(): string {
  return `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
