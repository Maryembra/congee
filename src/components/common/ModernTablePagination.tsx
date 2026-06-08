import { Box, MenuItem, Pagination, Select, Typography, type SelectChangeEvent } from '@mui/material'

type Props = {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: React.ChangeEvent<unknown> | null, page: number) => void
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void
  rowsPerPageOptions?: number[]
}

export default function ModernTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}: Props) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage))

  // The state page is 0-indexed, MUI Pagination is 1-indexed.
  const displayPage = page + 1

  const startRow = count === 0 ? 0 : page * rowsPerPage + 1
  const endRow = Math.min(count, (page + 1) * rowsPerPage)

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(event, value - 1)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 3,
        py: 1,
        px: 2,
        bgcolor: 'background.paper',
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Lignes par page :
        </Typography>
        <Select
          variant="standard"
          disableUnderline
          value={rowsPerPage}
          onChange={onRowsPerPageChange}
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              py: 0.5,
              pl: 0.5,
              pr: '20px !important',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
              right: -4,
            },
          }}
          MenuProps={{
            PaperProps: {
              elevation: 0,
              sx: {
                borderRadius: 3,
                mt: 0.5,
                minWidth: 80,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiMenuItem-root': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  justifyContent: 'center',
                }
              }
            }
          }}
        >
          {rowsPerPageOptions.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontWeight: 600 }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
          {startRow} à {endRow} sur {count}
        </Typography>
      </Box>

      <Pagination
        count={totalPages}
        page={displayPage}
        onChange={handlePageChange}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        siblingCount={1}
        boundaryCount={1}
        sx={{
          '& .MuiPaginationItem-root': {
            fontWeight: 600,
            borderRadius: 2,
          },
        }}
      />
    </Box>
  )
}