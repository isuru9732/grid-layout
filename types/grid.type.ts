export interface IPosition {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IGridPosition {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
}

export interface IAbsolutePosition extends IPosition, ISize {}

export interface IGridBox {
  id: string;
  gridPosition: IGridPosition;
  absolutePosition?: IAbsolutePosition;
  isSelected: boolean;
  color: string;
}

export interface IGridConfig {
  columns: number;
  columnGap: number;
  rowGap: number;
  cellHeight: number;
}

export interface IGridContainerProps {
  config?: Partial<IGridConfig>;
  initialBoxes?: Omit<IGridBox, 'isSelected'>[];
}

export interface IGridBoxProps {
  box: IGridBox;
  config: IGridConfig;
  onSelect: (id: string) => void;
  onDeselect: (id: string, IPosition: IPosition, ISize: ISize) => void;
  onDrag: (id: string, IPosition: IPosition) => void;
  onResize: (id: string, ISize: ISize) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  containerWidth: number;
}