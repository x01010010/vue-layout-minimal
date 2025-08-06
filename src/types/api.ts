import type { Ref } from 'vue';

/**
 * TypeScript interfaces and type definitions for a robust API interaction system
 * Provides comprehensive types for HTTP client configuration, interceptors, error handling,
 * caching, loading states, request cancellation, logging, and performance metrics
 */

// =============================================================================
// HTTP Methods and Status Codes
// =============================================================================

/**
 * Supported HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP status code ranges
 */
export type HttpStatusCode = number;

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =============================================================================
// Request and Response Types
// =============================================================================

/**
 * Generic API request configuration
 */
export interface ApiRequestConfig<TData = any> {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request data/body */
  data?: TData;
  /** URL parameters */
  params?: Record<string, any>;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials */
  withCredentials?: boolean;
  /** Response type expected */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  /** Custom request metadata */
  metadata?: Record<string, any>;
}

/**
 * Generic API response structure
 */
export interface ApiResponse<TData = any> {
  /** Response data */
  data: TData;
  /** HTTP status code */
  status: HttpStatusCode;
  /** Status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Original request configuration */
  config: ApiRequestConfig;
  /** Response timestamp */
  timestamp: number;
  /** Response duration in milliseconds */
  duration?: number;
}

/**
 * Query parameters for GET requests
 */
export interface QueryParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  /** File to upload */
  file: File;
  /** Field name for the file */
  fieldName: string;
  /** Additional form data */
  formData?: Record<string, string | number>;
  /** Upload progress callback */
  onProgress?: (progress: number) => void;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
}

// =============================================================================
// HTTP Client Configuration
// =============================================================================

/**
 * HTTP client configuration options
 */
export interface HttpClientConfig {
  /** Base URL for all requests */
  baseURL?: string;
  /** Default timeout for requests in milliseconds */
  timeout?: number;
  /** Default headers to include with all requests */
  defaultHeaders?: Record<string, string>;
  /** Whether to include credentials by default */
  withCredentials?: boolean;
  /** Maximum number of concurrent requests */
  maxConcurrentRequests?: number;
  /** Request queue configuration */
  queueConfig?: RequestQueueConfig;
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Cache configuration */
  cacheConfig?: CacheConfig;
  /** Authentication configuration */
  authConfig?: AuthConfig;
  /** Logging configuration */
  loggingConfig?: LoggingConfig;
}

/**
 * Request queue configuration
 */
export interface RequestQueueConfig {
  /** Maximum queue size */
  maxSize: number;
  /** Queue processing strategy */
  strategy: 'fifo' | 'lifo' | 'priority';
  /** Request priority function */
  priorityFn?: (request: ApiRequestConfig) => number;
}

// =============================================================================
// Interceptor Types
// =============================================================================

/**
 * Request interceptor function signature
 */
export type RequestInterceptor<TConfig = ApiRequestConfig> = (
  config: TConfig
) => TConfig | Promise<TConfig>;

/**
 * Response interceptor function signature
 */
export type ResponseInterceptor<TResponse = ApiResponse> = (
  response: TResponse
) => TResponse | Promise<TResponse>;

/**
 * Error interceptor function signature
 */
export type ErrorInterceptor = (
  error: ApiError
) => ApiError | Promise<ApiError> | never;

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  /** Request interceptors */
  request?: RequestInterceptor[];
  /** Response interceptors */
  response?: ResponseInterceptor[];
  /** Error interceptors */
  error?: ErrorInterceptor[];
}

// =============================================================================
// Error Handling Types
// =============================================================================

/**
 * API error types
 */
export type ApiErrorType = 
  | 'network'
  | 'timeout'
  | 'abort'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'unknown';

/**
 * Comprehensive API error interface
 */
export interface ApiError extends Error {
  /** Error type classification */
  type: ApiErrorType;
  /** HTTP status code if available */
  status?: HttpStatusCode;
  /** Status text */
  statusText?: string;
  /** Original request configuration */
  config?: ApiRequestConfig;
  /** Response data if available */
  response?: ApiResponse;
  /** Error timestamp */
  timestamp: number;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Retry attempt number */
  retryAttempt?: number;
  /** Additional error context */
  context?: Record<string, any>;
}

/**
 * Error handler function signature
 */
export type ErrorHandler = (error: ApiError) => void | Promise<void>;

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /** Error types this strategy handles */
  errorTypes: ApiErrorType[];
  /** Recovery function */
  recover: (error: ApiError) => Promise<ApiResponse | null>;
  /** Maximum recovery attempts */
  maxAttempts: number;
}

// =============================================================================
// Caching Types
// =============================================================================

/**
 * Cache storage strategies
 */
export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Storage type for cache */
  storage: CacheStorageType;
  /** Default cache TTL in milliseconds */
  defaultTTL: number;
  /** Maximum cache size */
  maxSize?: number;
  /** Cache key generation strategy */
  keyStrategy: 'url' | 'hash' | 'custom';
  /** Custom key generator function */
  keyGenerator?: (config: ApiRequestConfig) => string;
  /** Cache invalidation patterns */
  invalidationPatterns?: string[];
}

/**
 * Cache entry metadata
 */
export interface CacheEntry<TData = any> {
  /** Cached data */
  data: TData;
  /** Cache timestamp */
  timestamp: number;
  /** Time to live in milliseconds */
  ttl: number;
  /** Cache key */
  key: string;
  /** Request configuration hash */
  configHash: string;
  /** Access count */
  accessCount: number;
  /** Last access timestamp */
  lastAccess: number;
}

/**
 * Cache operations interface
 */
export interface CacheOperations {
  /** Get cached entry */
  get<TData = any>(key: string): Promise<CacheEntry<TData> | null>;
  /** Set cache entry */
  set<TData = any>(key: string, data: TData, ttl?: number): Promise<void>;
  /** Delete cache entry */
  delete(key: string): Promise<boolean>;
  /** Clear all cache entries */
  clear(): Promise<void>;
  /** Get cache statistics */
  getStats(): Promise<CacheStats>;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total entries in cache */
  totalEntries: number;
  /** Cache hit rate */
  hitRate: number;
  /** Cache miss rate */
  missRate: number;
  /** Total cache size in bytes */
  totalSize: number;
  /** Cache creation timestamp */
  createdAt: number;
  /** Last cleanup timestamp */
  lastCleanup: number;
}

// =============================================================================
// Loading State Management
// =============================================================================

/**
 * Loading state for individual requests
 */
export interface LoadingState {
  /** Whether request is currently loading */
  isLoading: boolean;
  /** Loading progress (0-100) */
  progress?: number;
  /** Loading message */
  message?: string;
  /** Request start timestamp */
  startTime?: number;
  /** Estimated completion time */
  estimatedCompletion?: number;
}

/**
 * Global loading state manager
 */
export interface LoadingStateManager {
  /** Active loading states by request ID */
  activeRequests: Map<string, LoadingState>;
  /** Whether any request is loading */
  isAnyLoading: boolean;
  /** Total number of active requests */
  activeCount: number;
  /** Global loading progress */
  globalProgress: number;
}

/**
 * Loading state composable return type
 */
export interface UseLoadingStateReturn {
  /** Current loading state */
  readonly loadingState: Readonly<Ref<LoadingState>>;
  /** Loading state manager */
  readonly manager: Readonly<LoadingStateManager>;
  
  /** Start loading */
  startLoading: (requestId: string, message?: string) => void;
  /** Update loading progress */
  updateProgress: (requestId: string, progress: number) => void;
  /** Stop loading */
  stopLoading: (requestId: string) => void;
  /** Clear all loading states */
  clearAll: () => void;
}

// =============================================================================
// Request Cancellation Types
// =============================================================================

/**
 * Request cancellation token
 */
export interface CancellationToken {
  /** Whether cancellation was requested */
  isCancellationRequested: boolean;
  /** Cancellation reason */
  reason?: string;
  /** Cancel the request */
  cancel: (reason?: string) => void;
  /** Register cancellation callback */
  onCancelled: (callback: (reason?: string) => void) => void;
}

/**
 * Cancellation token source
 */
export interface CancellationTokenSource {
  /** The cancellation token */
  token: CancellationToken;
  /** Cancel all associated requests */
  cancel: (reason?: string) => void;
}

/**
 * Request cancellation manager
 */
export interface RequestCancellationManager {
  /** Create new cancellation token source */
  createTokenSource: () => CancellationTokenSource;
  /** Cancel request by ID */
  cancelRequest: (requestId: string, reason?: string) => boolean;
  /** Cancel all requests */
  cancelAll: (reason?: string) => void;
  /** Get active request count */
  getActiveRequestCount: () => number;
}

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * Authentication token types
 */
export type AuthTokenType = 'bearer' | 'basic' | 'api-key' | 'custom';

/**
 * Authentication token interface
 */
export interface AuthToken {
  /** Token type */
  type: AuthTokenType;
  /** Token value */
  value: string;
  /** Token expiration timestamp */
  expiresAt?: number;
  /** Refresh token */
  refreshToken?: string;
  /** Token metadata */
  metadata?: Record<string, any>;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Token storage key */
  tokenStorageKey: string;
  /** Token refresh endpoint */
  refreshEndpoint?: string;
  /** Auto-refresh tokens */
  autoRefresh: boolean;
  /** Refresh threshold in milliseconds */
  refreshThreshold: number;
  /** Token validation function */
  validateToken?: (token: AuthToken) => boolean;
  /** Token refresh function */
  refreshToken?: (token: AuthToken) => Promise<AuthToken>;
}

/**
 * Authentication manager interface
 */
export interface AuthManager {
  /** Current authentication token */
  currentToken: AuthToken | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Set authentication token */
  setToken: (token: AuthToken) => void;
  /** Get current token */
  getToken: () => AuthToken | null;
  /** Clear authentication */
  clearAuth: () => void;
  /** Refresh token if needed */
  refreshIfNeeded: () => Promise<boolean>;
}

// =============================================================================
// Retry Logic Types
// =============================================================================

/**
 * Retry strategy types
 */
export type RetryStrategy = 'fixed' | 'exponential' | 'linear' | 'custom';

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Whether retry is enabled */
  enabled: boolean;
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Retry strategy */
  strategy: RetryStrategy;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier for exponential strategy */
  backoffMultiplier: number;
  /** Jitter factor (0-1) */
  jitter: number;
  /** Retryable error types */
  retryableErrors: ApiErrorType[];
  /** Custom retry condition */
  retryCondition?: (error: ApiError) => boolean;
  /** Custom delay calculator */
  delayCalculator?: (attempt: number, baseDelay: number) => number;
}

/**
 * Retry attempt information
 */
export interface RetryAttempt {
  /** Attempt number */
  attemptNumber: number;
  /** Delay before this attempt */
  delay: number;
  /** Error that triggered retry */
  error: ApiError;
  /** Timestamp of attempt */
  timestamp: number;
}

// =============================================================================
// Logging and Performance Types
// =============================================================================

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /** Whether logging is enabled */
  enabled: boolean;
  /** Minimum log level */
  level: LogLevel;
  /** Whether to log requests */
  logRequests: boolean;
  /** Whether to log responses */
  logResponses: boolean;
  /** Whether to log errors */
  logErrors: boolean;
  /** Whether to log performance metrics */
  logPerformance: boolean;
  /** Custom logger function */
  customLogger?: (level: LogLevel, message: string, data?: any) => void;
}

/**
 * Request log entry
 */
export interface RequestLogEntry {
  /** Log entry ID */
  id: string;
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Request configuration */
  config: ApiRequestConfig;
  /** Timestamp */
  timestamp: number;
  /** Additional data */
  data?: any;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Request ID */
  requestId: string;
  /** Request start time */
  startTime: number;
  /** Request end time */
  endTime: number;
  /** Total duration in milliseconds */
  duration: number;
  /** DNS lookup time */
  dnsLookupTime?: number;
  /** TCP connection time */
  tcpConnectionTime?: number;
  /** TLS handshake time */
  tlsHandshakeTime?: number;
  /** Time to first byte */
  timeToFirstByte?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Cache hit/miss */
  cacheStatus?: 'hit' | 'miss' | 'stale';
}

/**
 * Performance monitor interface
 */
export interface PerformanceMonitor {
  /** Start measuring request performance */
  startMeasurement: (requestId: string) => void;
  /** End measurement and get metrics */
  endMeasurement: (requestId: string) => PerformanceMetrics | null;
  /** Get performance statistics */
  getStats: () => PerformanceStats;
  /** Clear all measurements */
  clear: () => void;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Total requests measured */
  totalRequests: number;
  /** Average response time */
  averageResponseTime: number;
  /** Minimum response time */
  minResponseTime: number;
  /** Maximum response time */
  maxResponseTime: number;
  /** 95th percentile response time */
  p95ResponseTime: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Error rate */
  errorRate: number;
}

// =============================================================================
// HTTP Client Interface
// =============================================================================

/**
 * Main HTTP client interface
 */
export interface HttpClient {
  /** Client configuration */
  readonly config: HttpClientConfig;
  /** Request interceptors */
  readonly interceptors: InterceptorConfig;
  /** Cache operations */
  readonly cache: CacheOperations;
  /** Authentication manager */
  readonly auth: AuthManager;
  /** Loading state manager */
  readonly loading: LoadingStateManager;
  /** Cancellation manager */
  readonly cancellation: RequestCancellationManager;
  /** Performance monitor */
  readonly performance: PerformanceMonitor;
  
  /** Make a generic request */
  request<TResponse = any, TData = any>(
    config: ApiRequestConfig<TData>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Make a GET request */
  get<TResponse = any>(
    url: string,
    params?: QueryParams,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Make a POST request */
  post<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Make a PUT request */
  put<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Make a DELETE request */
  delete<TResponse = any>(
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Make a PATCH request */
  patch<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>>;
  
  /** Upload file */
  upload<TResponse = any>(
    url: string,
    fileConfig: FileUploadConfig,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>>;
}

// =============================================================================
// Vue.js Integration Types
// =============================================================================

/**
 * API composable configuration
 */
export interface UseApiConfig extends Partial<HttpClientConfig> {
  /** Whether to auto-execute on mount */
  immediate?: boolean;
  /** Default error handler */
  onError?: ErrorHandler;
  /** Default success handler */
  onSuccess?: (response: ApiResponse) => void;
}

/**
 * API composable return type
 */
export interface UseApiReturn<TData = any> {
  /** HTTP client instance */
  readonly client: HttpClient;
  /** Current response data */
  readonly data: Readonly<Ref<TData | null>>;
  /** Current error */
  readonly error: Readonly<Ref<ApiError | null>>;
  /** Loading state */
  readonly loading: Readonly<Ref<boolean>>;
  
  /** Execute request */
  execute: <TResponse = TData>(
    config: ApiRequestConfig
  ) => Promise<ApiResponse<TResponse>>;
  
  /** Reset state */
  reset: () => void;
  
  /** Refresh last request */
  refresh: () => Promise<void>;
}

/**
 * Resource composable configuration
 */
export interface UseResourceConfig<TData = any> extends UseApiConfig {
  /** Resource URL or URL generator */
  url: string | (() => string);
  /** Default query parameters */
  defaultParams?: QueryParams;
  /** Transform response data */
  transform?: (data: any) => TData;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Whether to enable real-time updates */
  realtime?: boolean;
}

/**
 * Resource composable return type
 */
export interface UseResourceReturn<TData = any> extends UseApiReturn<TData> {
  /** Fetch resource data */
  fetch: (params?: QueryParams) => Promise<void>;
  /** Create new resource */
  create: (data: Partial<TData>) => Promise<void>;
  /** Update resource */
  update: (id: string | number, data: Partial<TData>) => Promise<void>;
  /** Delete resource */
  remove: (id: string | number) => Promise<void>;
  /** Start polling */
  startPolling: () => void;
  /** Stop polling */
  stopPolling: () => void;
}