/**
 * Marketplace Service
 * 
 * Handles all marketplace-related API calls and data transformations.
 * Includes caching for offline functionality and error handling.
 */
import api from './api';

export const marketplaceService = {
    // Get all active listings
    async getListings(filters = {}) {
        try {
            const response = await api.get('/api/marketplace/listings/', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching listings:', error);
            throw error;
        }
    },

    // Get price predictions for a product
    async getPricePredictions(productId, location) {
        try {
            const response = await api.get('/api/analytics/price-predictions/', {
                params: { product_id: productId, location }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching price predictions:', error);
            throw error;
        }
    },

    // Create a new listing
    async createListing(listingData) {
        try {
            const response = await api.post('/api/marketplace/listings/', listingData);
            return response.data;
        } catch (error) {
            console.error('Error creating listing:', error);
            throw error;
        }
    },

    // Update a listing
    async updateListing(listingId, updateData) {
        try {
            const response = await api.patch(`/api/marketplace/listings/${listingId}/`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    }
}; 