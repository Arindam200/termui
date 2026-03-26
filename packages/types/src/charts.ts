export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
}

export interface BarChartProps {
  data: DataPoint[];
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  width?: number;
}

export interface LineChartProps {
  data: DataPoint[];
  title?: string;
  width?: number;
  height?: number;
  showAxes?: boolean;
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
}
