/**
 * Marketplace Screen Component
 * 
 * Displays available produce listings and price trends. Features AI-powered
 * price predictions and real-time market data to help farmers make informed
 * decisions.
 * 
 * Features:
 * - Price trend visualization
 * - List of available produce
 * - Real-time market data
 * - AI price predictions
 */
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListingCard } from '../components/ListingCard';
import { marketplaceService } from '../services/marketplaceService';
import { PriceChart } from '../components/PriceChart';

export default function MarketplaceScreen() {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [priceData, setPriceData] = useState(null);

  // Load initial data
  useEffect(() => {
    loadListings();
    loadPricePredictions();
  }, []);

  // Fetch available listings from the API
  const loadListings = async () => {
    try {
      const data = await marketplaceService.getListings();
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  // Load AI-powered price predictions
  const loadPricePredictions = async () => {
    try {
      const data = await marketplaceService.getPricePredictions();
      setPriceData(data);
    } catch (error) {
      console.error('Error loading price predictions:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Price Trend Chart Section */}
      {priceData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('marketplace.price_trends')}</Text>
          <PriceChart data={priceData} />
        </View>
      )}

      {/* Listings Section */}
      <FlatList
        data={listings}
        renderItem={({ item }) => <ListingCard listing={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

// Styles for marketplace layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContainer: {
    padding: 15,
  },
}); 