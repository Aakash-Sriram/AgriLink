// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock Google Maps
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }: { children: any }) => <div>{children}</div>,
  LoadScript: ({ children }: { children: any }) => <div>{children}</div>,
  Marker: () => <button>Marker</button>,
}));

// Mock Recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: any }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: ({ children }: { children: any }) => <div>{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: { children: any }) => <div>{children}</div>,
  Pie: ({ children }: { children: any }) => <div>{children}</div>,
  Cell: () => null,
}));

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks();
}); 