import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const Marketplace = React.lazy(() => import('./components/marketplace/Marketplace'));
const Logistics = React.lazy(() => import('./components/dashboard/Logistics'));
const Analytics = React.lazy(() => import('./components/dashboard/Analytics'));
const Training = React.lazy(() => import('./components/training/Training'));
const Login = React.lazy(() => import('./components/auth/Login'));

const App: React.FC = () => {
	return (
		<ErrorBoundary>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AuthProvider>
					<BrowserRouter>
						<React.Suspense fallback={<div>Loading...</div>}>
							<Routes>
								<Route path="/login" element={<Login />} />
								<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
								<Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
								<Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
								<Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
								<Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</React.Suspense>
					</BrowserRouter>
				</AuthProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
};

export default App;