import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#2E7D32', // Green for agriculture theme
			light: '#4CAF50',
			dark: '#1B5E20',
		},
		secondary: {
			main: '#FFA000', // Amber for contrast
			light: '#FFB300',
			dark: '#FF8F00',
		},
		background: {
			default: '#F5F5F5',
			paper: '#FFFFFF',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: '2.5rem',
			fontWeight: 500,
		},
		h2: {
			fontSize: '2rem',
			fontWeight: 500,
		},
		h3: {
			fontSize: '1.75rem',
			fontWeight: 500,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					textTransform: 'none',
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				},
			},
		},
	},
});