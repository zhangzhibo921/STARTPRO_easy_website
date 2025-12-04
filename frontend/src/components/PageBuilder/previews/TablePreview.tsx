import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const TablePreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    columns = [],
    rows = [],
    widthOption = 'full',
    backgroundColorOption = 'default'
  } = component.props

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const shellClass = `table-block ${backgroundColorOption === 'transparent' ? 'table-block--transparent' : 'table-block--default'}`

  const rowKeys =
    Array.isArray(rows) && rows.length > 0
      ? Array.from(new Set(rows.flatMap((row: any) => Object.keys(row || {}))))
      : []

  const columnsFromProps = Array.isArray(columns) ? columns : []
  const safeColumnsBase = columnsFromProps.length > 0 ? [...columnsFromProps] : []
  const existingKeys = new Set(safeColumnsBase.map(col => col.key).filter(Boolean))

  // 将 rows 中额外的列 key 合并进来，防止列数组未及时同步导致不显示
  rowKeys.forEach(key => {
    if (!existingKeys.has(key)) {
      safeColumnsBase.push({ key, label: key, align: 'left' })
    }
  })

  const safeColumns =
    safeColumnsBase.length > 0
      ? safeColumnsBase
      : [
          { key: 'item', label: '名称', align: 'left' },
          { key: 'value', label: '数值', align: 'center' },
          { key: 'status', label: '状态', align: 'right' }
        ]

  const safeRows = Array.isArray(rows)
    ? rows
    : [
        { item: '示例项', value: '123', status: '正常' },
        { item: '示例项 B', value: '87', status: '告警' }
      ]

  return (
    <div className={containerClass}>
      <div className={shellClass}>
        {title && <h3 className="table-block__title text-2xl font-bold mb-4">{title}</h3>}
        <div className="table-block__wrapper">
          <table className="table-block__table">
            <thead>
              <tr>
                {safeColumns.map((col: any) => (
                  <th key={col.key || col.label} className={`table-block__th ${col.align ? `align-${col.align}` : ''}`}>
                    {col.label || col.key || ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeRows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  {safeColumns.map((col: any, colIndex: number) => (
                    <td
                      key={`${rowIndex}-${col.key || col.label || col.align || colIndex}`}
                      className={`table-block__td ${col.align ? `align-${col.align}` : ''}`}
                    >
                      {row?.[col.key] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
