import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/material'

type Props = TypographyProps & {
  text: string
  gradient?: string
}

export default function GradientText({
  text,
  gradient = 'linear-gradient(135deg, #4338ca 0%, #ec4899 100%)',
  sx,
  ...props
}: Props) {
  return (
    <Typography
      {...props}
      sx={{
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        ...sx,
      }}
    >
      {text}
    </Typography>
  )
}
