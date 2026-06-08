import { GlobalStyles as MuiGlobalStyles } from '@mui/material'

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={{
        '@import': [
          'url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap")',
        ],
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: '#f8fafc',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: '#94a3b8',
        },
        '.fade-in': {
          animation: 'fadeIn 0.3s ease-in-out',
        },
        '.slide-up': {
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    />
  )
}
