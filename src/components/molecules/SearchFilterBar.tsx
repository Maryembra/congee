import { Search } from '@mui/icons-material'
import { Box, MenuItem, TextField } from '@mui/material'
import type { ReactNode } from 'react'

type FilterOption = {
  label: string
  value: string
}

type Props = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterOptions?: FilterOption[]
  filterLabel?: string
  leading?: ReactNode
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Filtrer',
  leading,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
        mb: 2,
      }}
    >
      {leading}

      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        sx={{ flexGrow: 1, maxWidth: { md: 320 }, ml: { md: leading ? 0 : 'auto' } }}
      />

      {filterOptions && onFilterChange && filterValue !== undefined ? (
        <TextField
          select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          size="small"
          label={filterLabel}
          sx={{ minWidth: { md: 200 } }}
        >
          {filterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ) : null}
    </Box>
  )
}
