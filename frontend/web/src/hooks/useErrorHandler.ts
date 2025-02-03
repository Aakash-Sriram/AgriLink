import { useCallback } from 'react';
import { APIError } from '../types/api';
import { ErrorHandler } from '../utils/error-handler';

export function useErrorHandler() {
	return useCallback((error: APIError) => {
		ErrorHandler.handleError(error, {
			context: {
				timestamp: new Date().toISOString(),
				errorCode: error.code,
			},
		});
	}, []);
}

export function useErrorBoundary() {
	return useCallback((error: Error) => {
		ErrorHandler.handleError(error, {
			context: {
				type: 'boundary',
				timestamp: new Date().toISOString(),
			},
		});
	}, []);
}