// Common types
export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

// Marketplace types
export interface Product {
	id: number;
	name: string;
	category: string;
	description: string;
	price: number;
	quantity: number;
	unit: string;
	created_at: string;
	updated_at: string;
}

export interface Order {
	id: number;
	product: Product;
	quantity: number;
	total_price: number;
	status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
	delivery_address: string;
	created_at: string;
}

// Analytics types
export interface PricePrediction {
	id: number;
	product_id: number;
	predicted_price: number;
	confidence: number;
	prediction_date: string;
}

export interface MarketTrend {
	id: number;
	product_id: number;
	trend_type: 'rising' | 'falling' | 'stable';
	percentage_change: number;
	period: string;
}

// IoT types
export interface Device {
	id: number;
	name: string;
	type: string;
	status: 'active' | 'inactive' | 'maintenance';
	last_ping: string;
}

export interface SensorReading {
	id: number;
	device_id: number;
	reading_type: string;
	value: number;
	unit: string;
	timestamp: string;
}

// Blockchain types
export interface Transaction {
	id: number;
	hash: string;
	from_address: string;
	to_address: string;
	amount: string;
	status: 'pending' | 'confirmed' | 'failed';
	timestamp: string;
}

// Training types
export interface Course {
	id: number;
	title: string;
	description: string;
	duration: number;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	modules: CourseModule[];
}

export interface CourseModule {
	id: number;
	title: string;
	content_type: 'video' | 'text' | 'quiz';
	content_url: string;
	duration: number;
}

// Error types
export interface APIError {
	code: string;
	message: string;
	details?: Record<string, string[]>;
}