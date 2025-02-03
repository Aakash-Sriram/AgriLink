import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logistics } from '../Logistics';

describe('Logistics Component', () => {
  const mockVehicles = [
    {
      id: '1',
      location: { lat: 20.5937, lng: 78.9629 },
      status: 'active' as const,
      currentDelivery: {
        orderId: 'ORDER123',
        destination: 'Mumbai',
        eta: '2024-02-20T15:00:00'
      }
    }
  ];

  const mockApiKey = 'test-api-key';

  it('renders without crashing', () => {
    render(<Logistics vehicles={mockVehicles} apiKey={mockApiKey} />);
    expect(screen.getByText('Logistics Management')).toBeInTheDocument();
  });

  it('displays vehicle details when marker is clicked', () => {
    render(<Logistics vehicles={mockVehicles} apiKey={mockApiKey} />);
    const marker = screen.getByRole('button');
    fireEvent.click(marker);
    expect(screen.getByText('Vehicle Details')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
  });

  it('handles vehicles without current delivery', () => {
    const vehiclesWithoutDelivery = [
      {
        id: '2',
        location: { lat: 19.0760, lng: 72.8777 },
        status: 'inactive' as const
      }
    ];
    render(<Logistics vehicles={vehiclesWithoutDelivery} apiKey={mockApiKey} />);
    const marker = screen.getByRole('button');
    fireEvent.click(marker);
    expect(screen.queryByText('Order ID:')).not.toBeInTheDocument();
  });

  it('updates center when map is moved', () => {
    const { container } = render(
      <Logistics vehicles={mockVehicles} apiKey={mockApiKey} />
    );
    const map = container.querySelector('.map-container');
    fireEvent.mouseDown(map!);
    fireEvent.mouseMove(map!, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(map!);
    // Verify center state was updated
  });
}); 