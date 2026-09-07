export type ColumnType = 'numeric' | 'categorical' | 'date'

export interface ColumnStats {
  min?: number
  max?: number
  mean?: number
  median?: number
  uniqueValues?: number
  nullCount?: number
  nullPercentage?: number
  topCategories?: { value: string; count: number }[]
}

export interface ColumnInfo {
  name: string
  type: ColumnType
  stats?: ColumnStats
}

export type ChartType = 
  | 'scatter' 
  | 'bar' 
  | 'line' 
  | 'cluster' 
  | 'outlier' 
  | 'pie'

export interface ChartItem {
  id?: string
  type: ChartType
  title: string
  caption: string
  xAxisKey?: string
  yAxisKey?: string
  groupKey?: string
  data: Record<string, any>[]
}

export interface CorrelationMatrix {
  columns: string[]
  matrix: number[][] // 2D array of correlation coefficients
}

export interface ClusterPoint {
  x: number
  y: number
  cluster: number
  label?: string
  [key: string]: any
}

export interface OutlierPoint {
  id: string | number
  column: string
  value: number | string
  severity: 'low' | 'medium' | 'high'
  reason: string
  rowValues: Record<string, any>
}

export interface DatasetStats {
  rows: number
  columns: number
  missing_handled: number
  duplicates_removed: number
  cleaned_at?: string
  data_quality_score?: number
}

export interface CellDiff {
  rowIndex: number
  column: string
  originalValue: any
  cleanedValue: any
  action: 'imputed' | 'deduplicated' | 'formatted' | 'outlier_clamped'
}

export interface TableRowData {
  _rowId: string
  _isNew?: boolean
  _hasChanges?: boolean
  [column: string]: any
}

export interface AnalysisResponse {
  dataset_id: string
  name: string
  summary: string
  stats: DatasetStats
  columns: ColumnInfo[]
  charts: ChartItem[]
  correlations: {
    columns: string[]
    matrix: number[][]
  }
  clusters?: ClusterPoint[]
  outliers?: OutlierPoint[]
  // Table view data
  rawDataSample?: Record<string, any>[]
  cleanedDataSample?: Record<string, any>[]
  diffs?: CellDiff[]
}

export type ProcessingStage = 'detecting' | 'cleaning' | 'analyzing' | 'generating' | 'done' | 'failed'

export interface StatusResponse {
  stage: 'detecting' | 'cleaning' | 'analyzing' | 'generating' | 'done' | 'failed'
  progress: number // 0 to 100
  message?: string
  currentStepIndex?: number
  error?: string
}

export interface UploadResponse {
  dataset_id: string
  status: 'queued' | 'processing' | 'done'
  filename?: string
  sizeBytes?: number
}

export interface HistoryItem {
  dataset_id: string
  name: string
  filename: string
  created_at: string
  rows: number
  columns: number
  status: 'ready' | 'processing' | 'failed'
  missing_handled?: number
}
