import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from './useErrorHandler';

interface WebSocketOptions {
	url: string;
	onMessage?: (data: any) => void;
	reconnectAttempts?: number;
	reconnectInterval?: number;
}

export function useWebSocket(options: WebSocketOptions) {
	const ws = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const { currentUser } = useAuth();
	const handleError = useErrorHandler();
	const reconnectCount = useRef(0);

	const connect = useCallback(() => {
		try {
			const token = currentUser?.getIdToken();
			const wsUrl = `${options.url}?token=${token}`;
			ws.current = new WebSocket(wsUrl);

			ws.current.onopen = () => {
				setIsConnected(true);
				reconnectCount.current = 0;
			};

			ws.current.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					options.onMessage?.(data);
				} catch (error) {
					handleError(error as Error);
				}
			};

			ws.current.onerror = (error) => {
				handleError(error as Error);
			};

			ws.current.onclose = () => {
				setIsConnected(false);
				if (reconnectCount.current < (options.reconnectAttempts || 3)) {
					setTimeout(() => {
						reconnectCount.current += 1;
						connect();
					}, options.reconnectInterval || 5000);
				}
			};
		} catch (error) {
			handleError(error as Error);
		}
	}, [currentUser, options, handleError]);

	const disconnect = useCallback(() => {
		if (ws.current) {
			ws.current.close();
			ws.current = null;
			setIsConnected(false);
		}
	}, []);

	const send = useCallback((data: unknown) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(data));
		}
	}, []);

	useEffect(() => {
		connect();
		return () => disconnect();
	}, [connect, disconnect]);

	return {
		isConnected,
		send,
		disconnect,
		reconnect: connect,
	};
}