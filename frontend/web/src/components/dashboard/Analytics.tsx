import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsProps {
  data: {
    date: string;
    price: number;
    volume: number;
    revenue: number;
    category: string;
  }[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const updateData = useCallback(() => {
    if (!mounted.current) return;
    // Update logic here
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const filterDataByTimeRange = () => {
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      switch (timeRange) {
        case 'day':
          return itemDate >= new Date(now.setDate(now.getDate() - 1));
        case 'week':
          return itemDate >= new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return itemDate >= new Date(now.setMonth(now.getMonth() - 1));
        default:
          return true;
      }
    });
    return filtered;
  };

  const renderChart = () => {
    const filteredData = filterDataByTimeRange();

    switch (chartType) {
      case 'line':
        return (
          <LineChart width={800} height={400} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              name="Price"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#82ca9d"
              name="Volume"
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart width={800} height={400} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
          </BarChart>
        );
      case 'pie':
        const categoryData = filteredData.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.revenue;
          return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(categoryData).map(([name, value]) => ({
          name,
          value
        }));

        return (
          <PieChart width={800} height={400}>
            <Pie
              data={pieData}
              cx={400}
              cy={200}
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
    }
  };

  return (
    <div className="analytics-container">
      <h2>Market Analytics</h2>
      <div className="controls">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as any)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
}; 