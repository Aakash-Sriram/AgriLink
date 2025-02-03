import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Vehicle {
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

interface LogisticsProps {
  vehicles: Vehicle[];
  apiKey: string;
}

export const Logistics: React.FC<LogisticsProps> = ({ vehicles, apiKey }) => {
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const mapStyles = {
    height: '70vh',
    width: '100%'
  };

  return (
    <div className="logistics-container">
      <h2>Logistics Management</h2>
      <div className="map-container">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={5}
            center={center}
          >
            {vehicles.map(vehicle => (
              <Marker
                key={vehicle.id}
                position={vehicle.location}
                onClick={() => setSelectedVehicle(vehicle)}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
      {selectedVehicle && (
        <div className="vehicle-details">
          <h3>Vehicle Details</h3>
          <p>ID: {selectedVehicle.id}</p>
          <p>Status: {selectedVehicle.status}</p>
          {selectedVehicle.currentDelivery && (
            <>
              <p>Order ID: {selectedVehicle.currentDelivery.orderId}</p>
              <p>Destination: {selectedVehicle.currentDelivery.destination}</p>
              <p>ETA: {selectedVehicle.currentDelivery.eta}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 