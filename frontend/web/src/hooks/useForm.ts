import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useErrorHandler } from './useErrorHandler';

interface UseFormOptions<T> {
	schema: z.ZodType<T>;
	onSubmit: (data: T) => Promise<void>;
}

export function useForm<T>({ schema, onSubmit }: UseFormOptions<T>) {
	const [data, setData] = useState<Partial<T>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const handleError = useErrorHandler();

	const validate = useCallback((formData: Partial<T>): boolean => {
		try {
			schema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path.length > 0) {
						formattedErrors[err.path.join('.')] = err.message;
					}
				});
				setErrors(formattedErrors);
			}
			return false;
		}
	}, [schema]);

	const handleChange = useCallback((field: keyof T, value: unknown) => {
		setData((prev) => {
			const newData = { ...prev, [field]: value };
			validate(newData);
			return newData;
		});
	}, [validate]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validate(data)) {
			return;
		}

		try {
			setLoading(true);
			await onSubmit(data as T);
		} catch (error) {
			handleError(error as Error);
		} finally {
			setLoading(false);
		}
	}, [data, validate, onSubmit, handleError]);

	const reset = useCallback(() => {
		setData({});
		setErrors({});
	}, []);

	return {
		data,
		errors,
		loading,
		handleChange,
		handleSubmit,
		reset,
	};
}