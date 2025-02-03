declare module '@components/dashboard/Analytics' {
  export interface AnalyticsProps {
    data: {
      date: string;
      price: number;
      volume: number;
      revenue: number;
      category: string;
    }[];
  }

  export const Analytics: React.FC<AnalyticsProps>;
}

declare module '@components/dashboard/Logistics' {
  export interface Vehicle {
    id: string;
    location: {
      lat: number;
      lng: number;
    };
    status: 'active' | 'inactive' | 'maintenance';
    currentDelivery?: {
      orderId: string;
      destination: string;
      eta: string;
    };
  }

  export interface LogisticsProps {
    vehicles: Vehicle[];
    apiKey: string;
  }

  export const Logistics: React.FC<LogisticsProps>;
} 