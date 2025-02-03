/**
 * ListingCard Component
 * 
 * Displays individual produce listings with price, quantity, and seller information.
 * Features quick actions for buyers and price trend indicators.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function ListingCard({ listing, onPress }) {
    const { t } = useTranslation();
    const { product, price_per_unit, quantity, unit, farmer } = listing;

    // Calculate price trend indicator
    const getPriceTrendIcon = () => {
        if (listing.price_trend > 0) return 'trending-up';
        if (listing.price_trend < 0) return 'trending-down';
        return 'trending-neutral';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.productName}>{product.name}</Text>
                <Icon 
                    name={getPriceTrendIcon()} 
                    size={24} 
                    color={listing.price_trend > 0 ? '#4CAF50' : '#F44336'} 
                />
            </View>

            <View style={styles.details}>
                <Text style={styles.price}>
                    ₹{price_per_unit}/{unit}
                </Text>
                <Text style={styles.quantity}>
                    {t('marketplace.available')}: {quantity} {unit}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.farmerName}>
                    {t('marketplace.seller')}: {farmer.name}
                </Text>
                <Text style={styles.location}>
                    {listing.location}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    details: {
        marginBottom: 10,
    },
    price: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: 14,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    farmerName: {
        fontSize: 14,
        color: '#666',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
}); 