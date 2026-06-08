import { Box, Typography } from '@mui/material'

const HexagonIcon = () => (
  <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
)

type Props = {
  size?: 'small' | 'large'
  invert?: boolean
}

export default function BrandMark({ size = 'small', invert = false }: Props) {
  const titleSize = size === 'large' ? 'h5' : 'subtitle1'
  const subtitleSize = size === 'large' ? 'body2' : 'caption'
  const emblemSize = size === 'large' ? 56 : 40
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: emblemSize,
          height: emblemSize,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: invert ? '#ffffff' : 'white',
          background: invert
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))'
            : 'linear-gradient(135deg, #4338ca 0%, #ec4899 100%)',
          boxShadow: invert ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 10px 24px rgba(67, 56, 202, 0.4)',
          border: '1px solid',
          borderColor: invert ? 'rgba(255, 255, 255, 0.2)' : 'rgba(236, 72, 153, 0.3)',
          flexShrink: 0,
        }}
      >
        <HexagonIcon />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15 }}>
        <Typography
          variant={titleSize}
          fontWeight={800}
          sx={{ color: invert ? 'white' : 'text.primary', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Digital Factory
        </Typography>
        <Typography
          variant={subtitleSize}
          fontWeight={500}
          sx={{ color: invert ? 'rgba(255, 255, 255, 0.7)' : 'primary.main', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: size === 'large' ? '0.75rem' : '0.65rem' }}
        >
        </Typography>
      </Box>
    </Box>
  )
}
