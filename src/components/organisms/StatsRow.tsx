import { Grid } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function StatsRow({ children }: Props) {
  // Use React.Children to count items and dynamically set Grid item xs/md props if needed,
  // but for simplicity we assume the children are already Grid items or we wrap them here.
  // Actually, we can just render the children inside a container.
  
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {children}
    </Grid>
  )
}
