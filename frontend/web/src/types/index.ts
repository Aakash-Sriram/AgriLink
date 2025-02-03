// Common types used across the application
export interface User {
  id: string;
  username: string;
  role: 'farmer' | 'buyer' | 'admin';
  phoneNumber: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  unit: string;
  quantity: number;
  farmerId: string;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
  quality: 'A' | 'B' | 'C';
  harvestDate: string;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered';
  deliveryDetails?: {
    vehicleId: string;
    eta: string;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
  paymentStatus: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  timeRange: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalSales: number;
    averagePrice: number;
    totalOrders: number;
    activeUsers: number;
  };
  trends: {
    date: string;
    price: number;
    volume: number;
    revenue: number;
    category: string;
  }[];
} 