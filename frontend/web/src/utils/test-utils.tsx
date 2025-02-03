import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Custom render function that includes providers
function render(ui: React.ReactElement, { route = '/' } = {}) {
  return rtlRender(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

// Generate mock data
export const generateMockAnalyticsData = (days: number) => {
  const data = [];
  const categories = ['Vegetables', 'Fruits', 'Grains'];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.floor(Math.random() * 100) + 50,
      volume: Math.floor(Math.random() * 1000) + 200,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  return data;
};

export const generateMockVehicles = (count: number) => {
  const vehicles = [];
  const statuses = ['active', 'inactive', 'maintenance'] as const;

  for (let i = 0; i < count; i++) {
    vehicles.push({
      id: `vehicle-${i}`,
      location: {
        lat: 20.5937 + (Math.random() - 0.5) * 2,
        lng: 78.9629 + (Math.random() - 0.5) * 2
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      ...(Math.random() > 0.3 && {
        currentDelivery: {
          orderId: `order-${i}`,
          destination: 'Test Destination',
          eta: new Date(Date.now() + Math.random() * 86400000).toISOString()
        }
      })
    });
  }
  return vehicles;
};

export * from '@testing-library/react';
export { render }; 