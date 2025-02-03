import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { Analytics } from '../Analytics';
import { generateMockAnalyticsData } from '../../utils/test-utils';

describe('Analytics Component', () => {
  const mockData = generateMockAnalyticsData(30); // Generate 30 days of data

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-20'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<Analytics data={mockData} />);
    expect(screen.getByText('Market Analytics')).toBeInTheDocument();
  });

  it('changes chart type when selector changes', () => {
    render(<Analytics data={mockData} />);
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'bar' } });
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('filters data based on time range', () => {
    render(<Analytics data={mockData} />);
    const timeSelector = screen.getAllByRole('combobox')[1];
    fireEvent.change(timeSelector, { target: { value: 'day' } });
    // Verify filtered data
  });

  it('displays pie chart with correct categories', () => {
    render(<Analytics data={mockData} />);
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'pie' } });
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();
  });
}); 