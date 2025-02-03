import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from './useApi';
import { useOfflineData } from './useOfflineData';
import { endpoints } from '../services/api';

interface UserProfile {
	id: string;
	email: string;
	displayName: string;
	role: 'farmer' | 'buyer' | 'admin';
	preferences: Record<string, unknown>;
	lastActive: string;
}

export function useUser() {
	const { currentUser } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const api = useApi<UserProfile>();
	const offlineData = useOfflineData<UserProfile>({ key: 'user_profile' });

	const fetchProfile = useCallback(async () => {
		if (!currentUser) return null;

		try {
			const data = await api.request('get', `${endpoints.users}/profile/`);
			setProfile(data);
			offlineData.saveData(data);
			return data;
		} catch (error) {
			// Fallback to offline data
			const cached = await offlineData.loadData();
			if (cached) setProfile(cached);
			return cached;
		}
	}, [currentUser, api, offlineData]);

	const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
		if (!currentUser) return null;

		const data = await api.request('put', `${endpoints.users}/profile/`, updates);
		setProfile(data);
		offlineData.saveData(data);
		return data;
	}, [currentUser, api, offlineData]);

	const updatePreferences = useCallback(async (preferences: Record<string, unknown>) => {
		if (!currentUser || !profile) return null;

		const updates = {
			...profile,
			preferences: {
				...profile.preferences,
				...preferences,
			},
		};

		return updateProfile(updates);
	}, [currentUser, profile, updateProfile]);

	useEffect(() => {
		if (currentUser) {
			fetchProfile();
		} else {
			setProfile(null);
			offlineData.clearData();
		}
	}, [currentUser, fetchProfile, offlineData]);

	return {
		profile,
		updateProfile,
		updatePreferences,
		loading: api.loading,
		error: api.error,
	};
}