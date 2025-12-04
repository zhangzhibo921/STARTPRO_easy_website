import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface TableEditorProps {
  columns: TableColumn[]
  rows: Record<string, any>[]
  onColumnsChange: (cols: TableColumn[]) => void
  onRowsChange: (rows: Record<string, any>[]) => void
}

const alignOptions: Array<{ label: string; value: TableColumn['align'] }> = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

const TableEditor: React.FC<TableEditorProps> = ({ columns, rows, onColumnsChange, onRowsChange }) => {
  const [localCols, setLocalCols] = React.useState<TableColumn[]>(columns || [])
  const [localRows, setLocalRows] = React.useState<Record<string, any>[]>(rows || [])

  React.useEffect(() => {
    setLocalCols(Array.isArray(columns) ? columns : [])
  }, [columns])

  React.useEffect(() => {
    setLocalRows(Array.isArray(rows) ? rows : [])
  }, [rows])

  // 保底同步：当本地列/行变化时，推送到上层（防止偶发不同步）
  React.useEffect(() => {
    onColumnsChange(localCols)
  }, [localCols]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    onRowsChange(localRows)
  }, [localRows]) // eslint-disable-line react-hooks/exhaustive-deps

  const addColumn = () => {
    const nextIndex = localCols.length + 1
    const newCol: TableColumn = { key: `col_${nextIndex}`, label: `列 ${nextIndex}`, align: 'left' }
    const nextCols = [...localCols, newCol]
    setLocalCols(nextCols)
    onColumnsChange(nextCols)
    const updatedRows = localRows.map(row => ({ ...row, [newCol.key]: '' }))
    setLocalRows(updatedRows)
    onRowsChange(updatedRows)
  }

  const updateColumn = (index: number, patch: Partial<TableColumn>) => {
    const nextCols = [...localCols]
    const prevKey = nextCols[index].key
    nextCols[index] = { ...nextCols[index], ...patch }
    setLocalCols(nextCols)
    onColumnsChange(nextCols)

    // 若修改了 key，迁移行数据
    if (patch.key && patch.key !== prevKey) {
      const updatedRows = localRows.map(row => {
        const { [prevKey]: prevValue, ...rest } = row
        return { ...rest, [patch.key as string]: prevValue }
      })
      setLocalRows(updatedRows)
      onRowsChange(updatedRows)
    }
  }

  const removeColumn = (index: number) => {
    const colKey = localCols[index]?.key
    const nextCols = localCols.filter((_, idx) => idx !== index)
    setLocalCols(nextCols)
    onColumnsChange(nextCols)
    if (!colKey) return
    const updatedRows = localRows.map(row => {
      const newRow = { ...row }
      delete (newRow as any)[colKey]
      return newRow
    })
    setLocalRows(updatedRows)
    onRowsChange(updatedRows)
  }

  const addRow = () => {
    const newRow: Record<string, any> = {}
    localCols.forEach(col => {
      newRow[col.key] = ''
    })
    const next = [...(localRows || []), newRow]
    setLocalRows(next)
    onRowsChange(next)
  }

  const updateCell = (rowIndex: number, colKey: string, value: any) => {
    const nextRows = [...localRows]
    nextRows[rowIndex] = { ...(nextRows[rowIndex] || {}), [colKey]: value }
    setLocalRows(nextRows)
    onRowsChange(nextRows)
  }

  const removeRow = (rowIndex: number) => {
    const nextRows = localRows.filter((_, idx) => idx !== rowIndex)
    setLocalRows(nextRows)
    onRowsChange(nextRows)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">表格列</h4>
        <button
          onClick={addColumn}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增列</span>
        </button>
      </div>

      <div className="space-y-3">
        {localCols.map((col, index) => (
          <div key={col.key + index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">列 {index + 1}</span>
              <button onClick={() => removeColumn(index)} className="p-1 text-red-500 hover:text-red-700">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={col.label || ''}
                onChange={(e) => updateColumn(index, { label: e.target.value })}
                placeholder="显示名称"
                className="w-full px-3 py-2 text-sm rounded theme-input"
              />
              <input
                type="text"
                value={col.key || ''}
                onChange={(e) => updateColumn(index, { key: e.target.value })}
                placeholder="字段 key（唯一）"
                className="w-full px-3 py-2 text-sm rounded theme-input"
              />
              <select
                value={col.align || 'left'}
                onChange={(e) => updateColumn(index, { align: e.target.value as TableColumn['align'] })}
                className="w-full px-3 py-2 text-sm rounded theme-input"
              >
                {alignOptions.map(opt => (
                  <option key={opt.value} value={opt.value || 'left'}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">表格行</h4>
        <button
          onClick={addRow}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增行</span>
        </button>
      </div>

      <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {localCols.map(col => (
                <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {col.label || col.key}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {localRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-gray-800/40">
                {localCols.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    <input
                      type="text"
                      value={row?.[col.key] ?? ''}
                      onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded theme-input"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {localRows.length === 0 && (
              <tr>
                <td colSpan={localCols.length + 1} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  暂无数据，点击“新增行”开始添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableEditor
