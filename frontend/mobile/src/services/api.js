/**
 * API Service Configuration
 * 
 * Central configuration for API communication with the backend.
 * Handles authentication, request interceptors, and offline caching.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
});

// Request interceptor for API calls
api.interceptors.request.use(
    async (config) => {
        // Check network status
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
            // Return cached data if available
            const cachedData = await AsyncStorage.getItem(config.url);
            if (cachedData) {
                return Promise.resolve(JSON.parse(cachedData));
            }
        }

        // Add auth headers
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    async (response) => {
        // Cache successful responses
        if (response.config.method === 'GET') {
            await AsyncStorage.setItem(
                response.config.url,
                JSON.stringify(response.data)
            );
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api; 