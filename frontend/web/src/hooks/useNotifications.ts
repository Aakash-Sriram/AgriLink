import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useApi } from './useApi';
import { useUser } from './useUser';
import { endpoints } from '../services/api';

interface Notification {
	id: string;
	type: 'info' | 'warning' | 'error' | 'success';
	title: string;
	message: string;
	read: boolean;
	createdAt: string;
	data?: Record<string, unknown>;
}

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const api = useApi<Notification[]>();
	const { profile } = useUser();
	const ws = useWebSocket({
		url: `${process.env.REACT_APP_WS_URL}/notifications/`,
		onMessage: handleWebSocketMessage,
	});

	function handleWebSocketMessage(data: any) {
		if (data.type === 'notification') {
			setNotifications(prev => [data.notification, ...prev]);
			setUnreadCount(prev => prev + 1);
		}
	}

	const fetchNotifications = useCallback(async () => {
		const data = await api.request('get', `${endpoints.communications}/notifications/`);
		setNotifications(data);
		setUnreadCount(data.filter((n: Notification) => !n.read).length);
	}, [api]);

	const markAsRead = useCallback(async (id: string) => {
		await api.request('put', `${endpoints.communications}/notifications/${id}/read/`);
		setNotifications(prev => 
			prev.map(n => n.id === id ? { ...n, read: true } : n)
		);
		setUnreadCount(prev => Math.max(0, prev - 1));
	}, [api]);

	const markAllAsRead = useCallback(async () => {
		await api.request('put', `${endpoints.communications}/notifications/read-all/`);
		setNotifications(prev => 
			prev.map(n => ({ ...n, read: true }))
		);
		setUnreadCount(0);
	}, [api]);

	const clearAll = useCallback(async () => {
		await api.request('delete', `${endpoints.communications}/notifications/clear-all/`);
		setNotifications([]);
		setUnreadCount(0);
	}, [api]);

	useEffect(() => {
		if (profile) {
			fetchNotifications();
		}
	}, [profile, fetchNotifications]);

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		clearAll,
		loading: api.loading,
		error: api.error,
		isConnected: ws.isConnected,
	};
}