/**
 * Test file to validate the request interceptor functionality
 * This demonstrates how to use the interceptor system
 */

import { BaseHttpClient, createAuthTokenInterceptor, createRequestIdInterceptor, createTimestampInterceptor, createHeaderInterceptor } from './http-client';
import type { ApiRequestConfig } from '../types/api';

// Create a test HTTP client
const client = new BaseHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000
});

// Test function to demonstrate interceptor usage
export async function testInterceptors() {
  console.log('🚀 Testing Request Interceptors...');

  // Add various interceptors with different priorities
  const requestIdInterceptorId = client.addRequestInterceptor(
    createRequestIdInterceptor(),
    100, // High priority
    'RequestIdInterceptor'
  );

  const timestampInterceptorId = client.addRequestInterceptor(
    createTimestampInterceptor(),
    90, // Medium-high priority
    'TimestampInterceptor'
  );

  const headerInterceptorId = client.addRequestInterceptor(
    createHeaderInterceptor(
      { 'X-Custom-Header': 'test-value' },
      (config: ApiRequestConfig) => ({ 'X-Dynamic-Header': `${config.method}-${Date.now()}` })
    ),
    80, // Medium priority
    'HeaderInterceptor'
  );

  // Mock auth config for testing
  const mockAuthConfig = {
    tokenStorageKey: 'test-token',
    autoRefresh: false,
    refreshThreshold: 300000
  };

  // Set a mock token in localStorage for testing
  if (typeof window !== 'undefined') {
    localStorage.setItem('test-token', JSON.stringify({
      type: 'bearer',
      value: 'mock-jwt-token-12345'
    }));
  }

  const authInterceptorId = client.addRequestInterceptor(
    createAuthTokenInterceptor(mockAuthConfig),
    70, // Lower priority (runs after headers are set)
    'AuthTokenInterceptor'
  );

  try {
    // Make a test request
    console.log('📤 Making test request...');
    const response = await client.get('/posts/1');
    
    console.log('✅ Request successful!');
    console.log('📊 Response data:', response.data);
    console.log('🔍 Request config used:', response.config);
    
    // Test interceptor removal
    console.log('🗑️ Testing interceptor removal...');
    const removed = client.removeRequestInterceptor(headerInterceptorId);
    console.log(`Header interceptor removed: ${removed}`);
    
    // Test clearing all interceptors
    console.log('🧹 Testing clear all interceptors...');
    const clearedCount = client.clearRequestInterceptors();
    console.log(`Cleared ${clearedCount} interceptors`);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export the interceptor creator functions for external use
export {
  createAuthTokenInterceptor,
  createRequestIdInterceptor,
  createTimestampInterceptor,
  createHeaderInterceptor
};