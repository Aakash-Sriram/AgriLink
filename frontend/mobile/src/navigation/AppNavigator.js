/**
 * Main Navigation Configuration
 * 
 * Sets up the application's navigation structure using React Navigation.
 * Implements a stack-based navigation system with translated screen titles
 * for better accessibility.
 * 
 * Navigation Flow:
 * Home -> Marketplace
 *      -> Training
 *      -> Profile
 *      -> Listings
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

// Import screen components
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ListingScreen from '../screens/ListingScreen';
import TrainingScreen from '../screens/TrainingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { t } = useTranslation();  // Initialize translations

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Home Screen - Main entry point */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: t('home.title') }}
        />
        {/* Marketplace Screen - For buying/selling produce */}
        <Stack.Screen 
          name="Marketplace" 
          component={MarketplaceScreen}
          options={{ title: t('marketplace.title') }}
        />
        {/* Additional screens to be added */}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 