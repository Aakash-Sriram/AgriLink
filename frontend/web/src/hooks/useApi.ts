import { useState, useCallback } from 'react';
import api from '../services/api';
import { APIError } from '../types/api';
import { useErrorHandler } from './useErrorHandler';

interface UseApiOptions<T> {
	onSuccess?: (data: T) => void;
	onError?: (error: APIError) => void;
}

export function useApi<T>(options: UseApiOptions<T> = {}) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const handleError = useErrorHandler();

	const request = useCallback(async (
		method: 'get' | 'post' | 'put' | 'delete',
		url: string,
		body?: unknown
	) => {
		try {
			setLoading(true);
			setError(null);

			const response = await api[method](url, body);
			setData(response.data);
			options.onSuccess?.(response.data);
			return response.data;
		} catch (err: unknown) {
			const apiError = err as APIError;
			setError(apiError);
			handleError(apiError);
			options.onError?.(apiError);
			throw apiError;
		} finally {
			setLoading(false);
		}
	}, [options, handleError]);

	return {
		data,
		loading,
		error,
		request,
	};
}