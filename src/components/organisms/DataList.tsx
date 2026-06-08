import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export type DataListColumn<T> = {
  key: string
  header: string
  render: (item: T) => ReactNode
}

type Props<T> = {
  items: T[]
  columns: DataListColumn<T>[]
  gridTemplateColumns: string
  getRowKey: (item: T) => string | number
  emptyMessage?: string
}

export default function DataList<T>({
  items,
  columns,
  gridTemplateColumns,
  getRowKey,
  emptyMessage = 'Aucun element a afficher.',
}: Props<T>) {
  return (
    <Box>
      <Box
        sx={{
          display: { xs: 'none', lg: 'grid' },
          gridTemplateColumns,
          gap: 2,
          px: 1,
          py: 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          color: 'text.secondary',
        }}
      >
        {columns.map((column) => (
          <Typography key={column.key} variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            {column.header}
          </Typography>
        ))}
      </Box>

      {!items.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, px: 1 }}>
          {emptyMessage}
        </Typography>
      ) : null}

      {items.map((item) => (
        <Box
          key={getRowKey(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: gridTemplateColumns },
            gap: 2,
            alignItems: 'center',
            px: 1,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.8)' },
          }}
        >
          {columns.map((column) => (
            <Box key={column.key}>{column.render(item)}</Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}
