import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useApi } from './useApi';
import { useOfflineData } from './useOfflineData';
import { endpoints } from '../services/api';
import { Device, SensorReading } from '../types/api';

interface DeviceStatus {
	deviceId: string;
	online: boolean;
	lastReading: SensorReading | null;
	batteryLevel: number;
	signalStrength: number;
}

export function useIoTDevices() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
	const api = useApi<Device[]>();
	const offlineData = useOfflineData<Device[]>({ key: 'iot_devices' });
	
	const ws = useWebSocket({
		url: `${process.env.REACT_APP_WS_URL}/iot/`,
		onMessage: handleWebSocketMessage,
	});

	function handleWebSocketMessage(data: any) {
		if (data.type === 'device_status') {
			setDeviceStatuses(prev => ({
				...prev,
				[data.deviceId]: {
					...prev[data.deviceId],
					...data.status,
				},
			}));
		} else if (data.type === 'sensor_reading') {
			setDeviceStatuses(prev => ({
				...prev,
				[data.deviceId]: {
					...prev[data.deviceId],
					lastReading: data.reading,
				},
			}));
		}
	}

	const fetchDevices = useCallback(async () => {
		try {
			const data = await api.request('get', `${endpoints.iot}/devices/`);
			setDevices(data);
			offlineData.saveData(data);
			return data;
		} catch (error) {
			const cached = await offlineData.loadData();
			if (cached) setDevices(cached);
			return cached;
		}
	}, [api, offlineData]);

	const getDeviceReadings = useCallback(async (deviceId: string, timeRange: string) => {
		return api.request('get', `${endpoints.iot}/devices/${deviceId}/readings/?range=${timeRange}`);
	}, [api]);

	const updateDeviceConfig = useCallback(async (deviceId: string, config: Record<string, unknown>) => {
		return api.request('put', `${endpoints.iot}/devices/${deviceId}/config/`, config);
	}, [api]);

	useEffect(() => {
		fetchDevices();
	}, [fetchDevices]);

	return {
		devices,
		deviceStatuses,
		getDeviceReadings,
		updateDeviceConfig,
		loading: api.loading,
		error: api.error,
		isConnected: ws.isConnected,
	};
}