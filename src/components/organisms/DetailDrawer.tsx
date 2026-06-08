import { Drawer } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number | string | { xs?: number | string; md?: number | string }
}

export default function DetailDrawer({ open, onClose, children, width = { xs: '100%', md: 520 } }: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width, p: 3 } }}>
      {children}
    </Drawer>
  )
}
