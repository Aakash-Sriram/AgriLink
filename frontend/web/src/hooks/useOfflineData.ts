import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface OfflineStorageOptions {
	key: string;
	ttl?: number; // Time to live in milliseconds
}

export function useOfflineData<T>(options: OfflineStorageOptions) {
	const [data, setData] = useState<T | null>(null);
	const handleError = useErrorHandler();

	const storeKey = `agrilink_${options.key}`;
	const ttl = options.ttl || 24 * 60 * 60 * 1000; // Default 24 hours

	useEffect(() => {
		loadData();
	}, []);

	const loadData = useCallback(async () => {
		try {
			const stored = localStorage.getItem(storeKey);
			if (!stored) return null;

			const { value, timestamp } = JSON.parse(stored);
			const isExpired = Date.now() - timestamp > ttl;

			if (isExpired) {
				localStorage.removeItem(storeKey);
				return null;
			}

			setData(value);
			return value;
		} catch (error) {
			handleError(error as Error);
			return null;
		}
	}, [storeKey, ttl, handleError]);

	const saveData = useCallback(async (value: T) => {
		try {
			const item = {
				value,
				timestamp: Date.now(),
			};
			localStorage.setItem(storeKey, JSON.stringify(item));
			setData(value);
		} catch (error) {
			handleError(error as Error);
		}
	}, [storeKey, handleError]);

	const clearData = useCallback(() => {
		try {
			localStorage.removeItem(storeKey);
			setData(null);
		} catch (error) {
			handleError(error as Error);
		}
	}, [storeKey, handleError]);

	return {
		data,
		saveData,
		clearData,
		loadData,
	};
}