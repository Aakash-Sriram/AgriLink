import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL;

const api: AxiosInstance = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
api.interceptors.request.use(
	async (config) => {
		const user = auth.currentUser;
		if (user) {
			const token = await user.getIdToken();
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (error.response?.status === 401) {
			// Handle token refresh or logout
			auth.signOut();
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;

// API endpoints
export const endpoints = {
	marketplace: {
		products: '/marketplace/products/',
		listings: '/marketplace/listings/',
		orders: '/marketplace/orders/',
	},
	logistics: {
		vehicles: '/logistics/vehicles/',
		routes: '/logistics/routes/',
		tracking: '/logistics/tracking/',
	},
	analytics: {
		predictions: '/analytics/price-predictions/',
		trends: '/analytics/market-trends/',
		reports: '/analytics/generate-report/',
	},
	training: {
		courses: '/training/courses/',
		progress: '/training/progress/',
		certificates: '/training/download-certificate/',
	},
	blockchain: {
		transactions: '/blockchain/transactions/',
		contracts: '/blockchain/contracts/',
		payments: '/blockchain/payments/',
	},
	iot: {
		devices: '/iot/devices/',
		sensors: '/iot/sensors/',
		readings: '/iot/readings/',
	},
};