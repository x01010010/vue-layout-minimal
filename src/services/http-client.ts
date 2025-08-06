import type {
  HttpClient,
  HttpClientConfig,
  ApiRequestConfig,
  ApiResponse,
  QueryParams,
  ApiError,
  ApiErrorType,
  FileUploadConfig,
  InterceptorConfig,
  RequestInterceptor,
  AuthConfig,
  CacheOperations,
  AuthManager,
  LoadingStateManager,
  RequestCancellationManager,
  PerformanceMonitor
} from '../types/api.ts';

/**
 * Utility function to serialize query parameters into a URL search string
 * @param params - Object containing query parameters
 * @returns URL search string (without leading '?')
 */
function serializeQueryParams(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle array values by appending each item
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * Generate a UUID v4 string for request tracking
 * @returns UUID v4 string
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Built-in interceptor for automatic authentication token injection
 * @param authConfig - Authentication configuration
 * @returns Request interceptor function
 */
export function createAuthTokenInterceptor(authConfig: AuthConfig): RequestInterceptor {
  return (config: ApiRequestConfig): ApiRequestConfig => {
    // Get token from storage or provided source
    let token: string | null = null;
    
    if (typeof window !== 'undefined' && authConfig.tokenStorageKey) {
      token = localStorage.getItem(authConfig.tokenStorageKey);
    }
    
    // If no token found, return config unchanged
    if (!token) {
      return config;
    }
    
    // Parse token if it's stored as JSON
    let authToken: any;
    try {
      authToken = JSON.parse(token);
    } catch {
      // If parsing fails, treat as plain string token
      authToken = { type: 'bearer', value: token };
    }
    
    // Validate token if validation function is provided
    if (authConfig.validateToken && !authConfig.validateToken(authToken)) {
      return config;
    }
    
    // Create new config with authentication header
    const newConfig = { ...config };
    newConfig.headers = { ...config.headers };
    
    // Add appropriate authorization header based on token type
    switch (authToken.type) {
      case 'bearer':
        newConfig.headers['Authorization'] = `Bearer ${authToken.value}`;
        break;
      case 'basic':
        newConfig.headers['Authorization'] = `Basic ${authToken.value}`;
        break;
      case 'api-key':
        newConfig.headers['X-API-Key'] = authToken.value;
        break;
      case 'custom':
        // For custom tokens, expect the full header value
        newConfig.headers['Authorization'] = authToken.value;
        break;
      default:
        // Default to Bearer token
        newConfig.headers['Authorization'] = `Bearer ${authToken.value}`;
    }
    
    return newConfig;
  };
}

/**
 * Built-in interceptor for automatic request ID generation and tracking
 * @param headerName - Header name for the request ID (default: 'X-Request-ID')
 * @returns Request interceptor function
 */
export function createRequestIdInterceptor(headerName: string = 'X-Request-ID'): RequestInterceptor {
  return (config: ApiRequestConfig): ApiRequestConfig => {
    // Create new config with request ID header
    const newConfig = { ...config };
    newConfig.headers = { ...config.headers };
    
    // Generate unique request ID
    const requestId = generateUUID();
    
    // Add request ID to headers
    newConfig.headers[headerName] = requestId;
    
    // Also add to metadata for internal tracking
    newConfig.metadata = {
      ...config.metadata,
      requestId
    };
    
    return newConfig;
  };
}

/**
 * Built-in interceptor for automatic request timestamp addition
 * @param headerName - Header name for the timestamp (default: 'X-Request-Timestamp')
 * @param format - Timestamp format: 'iso' for ISO string, 'unix' for Unix timestamp (default: 'iso')
 * @returns Request interceptor function
 */
export function createTimestampInterceptor(
  headerName: string = 'X-Request-Timestamp',
  format: 'iso' | 'unix' = 'iso'
): RequestInterceptor {
  return (config: ApiRequestConfig): ApiRequestConfig => {
    // Create new config with timestamp header
    const newConfig = { ...config };
    newConfig.headers = { ...config.headers };
    
    // Generate timestamp
    const now = new Date();
    const timestamp = format === 'iso' ? now.toISOString() : now.getTime().toString();
    
    // Add timestamp to headers
    newConfig.headers[headerName] = timestamp;
    
    // Also add to metadata for internal tracking
    newConfig.metadata = {
      ...config.metadata,
      requestTimestamp: now.getTime()
    };
    
    return newConfig;
  };
}

/**
 * Built-in interceptor for custom header management
 * @param headers - Static headers to add to all requests
 * @param dynamicHeaders - Function that returns headers based on request config
 * @param overwrite - Whether to overwrite existing headers (default: false)
 * @returns Request interceptor function
 */
export function createHeaderInterceptor(
  headers?: Record<string, string>,
  dynamicHeaders?: (config: ApiRequestConfig) => Record<string, string>,
  overwrite: boolean = false
): RequestInterceptor {
  return (config: ApiRequestConfig): ApiRequestConfig => {
    // Create new config with merged headers
    const newConfig = { ...config };
    newConfig.headers = { ...(config.headers || {}) };
    
    // Add static headers
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (overwrite || !newConfig.headers![key]) {
          newConfig.headers![key] = value;
        }
      });
    }
    
    // Add dynamic headers
    if (dynamicHeaders) {
      const dynamicHeadersResult = dynamicHeaders(config);
      Object.entries(dynamicHeadersResult).forEach(([key, value]) => {
        if (overwrite || !newConfig.headers![key]) {
          newConfig.headers![key] = value;
        }
      });
    }
    
    return newConfig;
  };
}

/**
 * Interceptor registration entry with metadata
 */
interface InterceptorEntry {
  /** Unique identifier for the interceptor */
  id: string;
  /** The interceptor function */
  interceptor: RequestInterceptor;
  /** Priority for execution order (higher = earlier execution) */
  priority: number;
  /** Optional name for debugging */
  name?: string;
}

/**
 * Core HTTP client implementation using the Fetch API
 * Provides basic HTTP functionality with proper TypeScript typing
 */
export class BaseHttpClient implements HttpClient {
  /** Client configuration */
  readonly config: HttpClientConfig;
  
  /** Private array to store registered request interceptors */
  private requestInterceptors: InterceptorEntry[] = [];
  
  /** Private counter for generating unique interceptor IDs */
  private interceptorIdCounter = 0;
  
  // Placeholder implementations for interface compliance
  // These will be implemented in subsequent steps
  readonly interceptors: InterceptorConfig = {};
  readonly cache: CacheOperations = {} as CacheOperations;
  readonly auth: AuthManager = {} as AuthManager;
  readonly loading: LoadingStateManager = {} as LoadingStateManager;
  readonly cancellation: RequestCancellationManager = {} as RequestCancellationManager;
  readonly performance: PerformanceMonitor = {} as PerformanceMonitor;

  /**
   * Initialize the HTTP client with configuration
   * @param config - HTTP client configuration options
   */
  constructor(config: HttpClientConfig = {}) {
    // Merge provided config with defaults
    this.config = {
      timeout: 30000, // 30 seconds default
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false,
      maxConcurrentRequests: 10,
      ...config
    };
  }

  /**
   * Add a request interceptor to the client
   * @param interceptor - The request interceptor function
   * @param priority - Priority for execution order (higher = earlier execution, default: 0)
   * @param name - Optional name for debugging purposes
   * @returns Unique identifier for the interceptor (used for removal)
   */
  addRequestInterceptor(
    interceptor: RequestInterceptor,
    priority: number = 0,
    name?: string
  ): string {
    // Generate unique ID for this interceptor
    const id = `interceptor_${++this.interceptorIdCounter}`;
    
    // Create interceptor entry
    const entry: InterceptorEntry = {
      id,
      interceptor,
      priority,
      name
    };
    
    // Add to the array
    this.requestInterceptors.push(entry);
    
    // Sort by priority (higher priority first)
    this.requestInterceptors.sort((a, b) => b.priority - a.priority);
    
    return id;
  }

  /**
   * Remove a request interceptor from the client
   * @param interceptorId - The unique identifier returned by addRequestInterceptor
   * @returns True if the interceptor was found and removed, false otherwise
   */
  removeRequestInterceptor(interceptorId: string): boolean {
    const initialLength = this.requestInterceptors.length;
    
    // Filter out the interceptor with the matching ID
    this.requestInterceptors = this.requestInterceptors.filter(
      entry => entry.id !== interceptorId
    );
    
    // Return true if an interceptor was actually removed
    return this.requestInterceptors.length < initialLength;
  }

  /**
   * Clear all request interceptors from the client
   * @returns Number of interceptors that were removed
   */
  clearRequestInterceptors(): number {
    const removedCount = this.requestInterceptors.length;
    this.requestInterceptors = [];
    return removedCount;
  }

  /**
   * Execute request interceptors on the configuration
   * @param config - Request configuration
   * @returns Promise resolving to processed configuration
   */
  private async executeRequestInterceptors<TData = any>(
    config: ApiRequestConfig<TData>
  ): Promise<ApiRequestConfig<TData>> {
    let processedConfig = config;
    
    // Execute interceptors in priority order (already sorted)
    for (const entry of this.requestInterceptors) {
      try {
        const result = await entry.interceptor(processedConfig);
        processedConfig = result;
      } catch (error) {
        // Log interceptor error but continue with other interceptors
        console.warn(`Request interceptor "${entry.name || entry.id}" failed:`, error);
        // Continue with the current config if interceptor fails
      }
    }
    
    return processedConfig;
  }

  /**
   * Make a generic HTTP request
   * @param config - Request configuration
   * @returns Promise resolving to API response
   */
  async request<TResponse = any, TData = any>(
    config: ApiRequestConfig<TData>
  ): Promise<ApiResponse<TResponse>> {
    const startTime = Date.now();
    
    // Merge configuration with defaults
    let mergedConfig = this.mergeConfig(config);
    
    // Execute request interceptors
    mergedConfig = await this.executeRequestInterceptors(mergedConfig);
    
    // Build the complete URL
    const url = this.buildUrl(mergedConfig.url, mergedConfig.params);
    
    // Create AbortController for request cancellation
    const abortController = new AbortController();
    
    // Set up timeout if specified
    let timeoutId: NodeJS.Timeout | undefined;
    if (mergedConfig.timeout && mergedConfig.timeout > 0) {
      timeoutId = setTimeout(() => {
        abortController.abort();
      }, mergedConfig.timeout);
    }
    
    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: mergedConfig.method,
        headers: mergedConfig.headers,
        signal: abortController.signal,
        credentials: mergedConfig.withCredentials ? 'include' : 'same-origin'
      };
      
      // Add body for methods that support it
      if (mergedConfig.data && ['POST', 'PUT', 'PATCH'].includes(mergedConfig.method)) {
        if (mergedConfig.data instanceof FormData) {
          fetchOptions.body = mergedConfig.data;
          // Remove Content-Type header for FormData (browser will set it with boundary)
          delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
        } else {
          fetchOptions.body = JSON.stringify(mergedConfig.data);
        }
      }
      
      // Make the fetch request
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout if request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Transform response to ApiResponse format
      return await this.transformResponse<TResponse>(response, mergedConfig, startTime);
      
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle and transform errors
      throw this.transformError(error, mergedConfig, startTime);
    }
  }

  /**
   * Merge request configuration with client defaults
   * @param config - Request configuration
   * @returns Merged configuration
   */
  private mergeConfig<TData = any>(config: ApiRequestConfig<TData>): ApiRequestConfig<TData> {
    return {
      ...config,
      headers: {
        ...this.config.defaultHeaders,
        ...config.headers
      },
      timeout: config.timeout ?? this.config.timeout,
      withCredentials: config.withCredentials ?? this.config.withCredentials
    };
  }

  /**
   * Build complete URL with base URL and query parameters
   * @param url - Request URL
   * @param params - Query parameters
   * @returns Complete URL string
   */
  private buildUrl(url: string, params?: QueryParams): string {
    let fullUrl = url;
    
    // Add base URL if provided and URL is relative
    if (this.config.baseURL && !url.startsWith('http')) {
      const baseUrl = this.config.baseURL.endsWith('/') 
        ? this.config.baseURL.slice(0, -1) 
        : this.config.baseURL;
      const path = url.startsWith('/') ? url : `/${url}`;
      fullUrl = `${baseUrl}${path}`;
    }
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryString = serializeQueryParams(params);
      if (queryString) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}${queryString}`;
      }
    }
    
    return fullUrl;
  }

  /**
   * Transform fetch Response to ApiResponse format
   * @param response - Fetch Response object
   * @param config - Request configuration
   * @param startTime - Request start timestamp
   * @returns Transformed ApiResponse
   */
  private async transformResponse<TResponse>(
    response: Response,
    config: ApiRequestConfig,
    startTime: number
  ): Promise<ApiResponse<TResponse>> {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Extract response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Parse response data based on content type
    let data: TResponse;
    const contentType = response.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (config.responseType === 'blob') {
        data = await response.blob() as TResponse;
      } else if (config.responseType === 'arraybuffer') {
        data = await response.arrayBuffer() as TResponse;
      } else {
        data = await response.text() as TResponse;
      }
    } catch (parseError) {
      // If parsing fails, return empty data
      data = null as TResponse;
    }
    
    // Check if response is successful
    if (!response.ok) {
      throw this.createHttpError(response, data, config, duration);
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      config,
      timestamp: endTime,
      duration
    };
  }

  /**
   * Transform various errors into ApiError format
   * @param error - Original error
   * @param config - Request configuration
   * @param startTime - Request start timestamp
   * @returns Transformed ApiError
   */
  private transformError(error: any, config: ApiRequestConfig, startTime: number): ApiError {
    const timestamp = Date.now();
    const duration = timestamp - startTime;
    
    // Handle AbortError (timeout or manual cancellation)
    if (error.name === 'AbortError') {
      return this.createApiError(
        'timeout',
        'Request was aborted due to timeout or cancellation',
        config,
        timestamp,
        duration
      );
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createApiError(
        'network',
        'Network error occurred during request',
        config,
        timestamp,
        duration
      );
    }
    
    // Handle other errors
    return this.createApiError(
      'unknown',
      error.message || 'An unknown error occurred',
      config,
      timestamp,
      duration
    );
  }

  /**
   * Create HTTP error for non-2xx responses
   * @param response - Fetch Response object
   * @param data - Response data
   * @param config - Request configuration
   * @param duration - Request duration
   * @returns ApiError
   */
  private createHttpError(
    response: Response,
    data: any,
    config: ApiRequestConfig,
    duration: number
  ): ApiError {
    let errorType: ApiErrorType;
    
    if (response.status === 401) {
      errorType = 'authentication';
    } else if (response.status === 403) {
      errorType = 'authorization';
    } else if (response.status === 404) {
      errorType = 'not_found';
    } else if (response.status === 422) {
      errorType = 'validation';
    } else if (response.status >= 500) {
      errorType = 'server';
    } else {
      errorType = 'unknown';
    }
    
    const apiError = this.createApiError(
      errorType,
      `HTTP ${response.status}: ${response.statusText}`,
      config,
      Date.now(),
      duration
    );
    
    apiError.status = response.status;
    apiError.statusText = response.statusText;
    apiError.response = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: {},
      config,
      timestamp: Date.now(),
      duration
    };
    
    return apiError;
  }

  /**
   * Create a standardized ApiError
   * @param type - Error type
   * @param message - Error message
   * @param config - Request configuration
   * @param timestamp - Error timestamp
   * @param duration - Request duration
   * @returns ApiError
   */
  private createApiError(
    type: ApiErrorType,
    message: string,
    config: ApiRequestConfig,
    timestamp: number,
    duration: number
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.type = type;
    error.config = config;
    error.timestamp = timestamp;
    error.retryable = ['network', 'timeout', 'server'].includes(type);
    error.context = { duration };
    
    return error;
  }

  /**
   * Make a GET request
   * @param url - Request URL
   * @param params - Query parameters
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async get<TResponse = any>(
    url: string,
    params?: QueryParams,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      url,
      method: 'GET',
      params,
      ...config
    });
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async post<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TData>({
      url,
      method: 'POST',
      data,
      ...config
    });
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async put<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TData>({
      url,
      method: 'PUT',
      data,
      ...config
    });
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async delete<TResponse = any>(
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      url,
      method: 'DELETE',
      ...config
    });
  }

  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async patch<TResponse = any, TData = any>(
    url: string,
    data?: TData,
    config?: Partial<ApiRequestConfig<TData>>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TData>({
      url,
      method: 'PATCH',
      data,
      ...config
    });
  }

  /**
   * Upload a file
   * @param url - Upload URL
   * @param fileConfig - File upload configuration
   * @param config - Additional request configuration
   * @returns Promise resolving to API response
   */
  async upload<TResponse = any>(
    url: string,
    fileConfig: FileUploadConfig,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<TResponse>> {
    // Validate file type if specified
    if (fileConfig.allowedTypes && fileConfig.allowedTypes.length > 0) {
      const fileType = fileConfig.file.type;
      if (!fileConfig.allowedTypes.includes(fileType)) {
        throw this.createApiError(
          'validation',
          `File type ${fileType} is not allowed. Allowed types: ${fileConfig.allowedTypes.join(', ')}`,
          { url, method: 'POST' } as ApiRequestConfig,
          Date.now(),
          0
        );
      }
    }
    
    // Validate file size if specified
    if (fileConfig.maxSize && fileConfig.file.size > fileConfig.maxSize) {
      throw this.createApiError(
        'validation',
        `File size ${fileConfig.file.size} bytes exceeds maximum allowed size of ${fileConfig.maxSize} bytes`,
        { url, method: 'POST' } as ApiRequestConfig,
        Date.now(),
        0
      );
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append(fileConfig.fieldName, fileConfig.file);
    
    // Add additional form data if provided
    if (fileConfig.formData) {
      Object.entries(fileConfig.formData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    // Make the upload request
    return this.request<TResponse>({
      url,
      method: 'POST',
      data: formData,
      ...config
    });
  }
}