# REST API Form Builder Architecture

## Overview
A sophisticated multi-step form interface for building REST API request payloads with draft persistence, real-time validation, and execution capabilities.

## Component Architecture

```mermaid
graph TB
    subgraph "Main Components"
        A[ApiBuilderPage] --> B[StepperNavigation]
        A --> C[MultiStepForm]
        A --> D[DraftManager]
        
        C --> E[Step1: Method & URL]
        C --> F[Step2: Headers]
        C --> G[Step3: Query Params]
        C --> H[Step4: Request Body]
        C --> I[Step5: Authentication]
        C --> J[Step6: Review & Execute]
    end
    
    subgraph "Services"
        D --> K[LocalStorageService]
        J --> L[ApiExecutionService]
        L --> M[HttpClient]
    end
    
    subgraph "State Management"
        N[FormStateStore] --> O[Validation Rules]
        N --> P[Step Progress]
        N --> Q[Draft State]
    end
    
    subgraph "UI Components"
        R[LoadingIndicators]
        S[NotificationSystem]
        T[DraftRestorationModal]
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant Validator
    participant DraftManager
    participant LocalStorage
    participant ApiService
    
    User->>Form: Enter data
    Form->>Validator: Validate input
    Validator-->>Form: Validation result
    Form->>DraftManager: Auto-save draft
    DraftManager->>LocalStorage: Persist data
    
    User->>Form: Navigate steps
    Form->>DraftManager: Save step state
    
    User->>Form: Submit request
    Form->>ApiService: Execute API call
    ApiService-->>Form: Response/Error
    Form-->>User: Display result
```

## Form Steps Detail

### Step 1: HTTP Method & URL
- Method selector (GET, POST, PUT, DELETE, PATCH)
- URL input with validation
- Base URL configuration option

### Step 2: Request Headers
- Dynamic key-value pairs
- Common header presets
- Add/remove functionality
- Validation for header format

### Step 3: Query Parameters
- Dynamic key-value pairs
- URL encoding preview
- Parameter validation

### Step 4: Request Body
- JSON editor with syntax highlighting
- Schema validation
- Format beautification
- Raw/formatted view toggle

### Step 5: Authentication
- Type selector (None, Bearer Token, Basic Auth, API Key)
- Credential inputs based on type
- Secure storage considerations

### Step 6: Review & Execute
- Complete request preview
- Inline editing capability
- Execute button with loading state
- Response viewer

## Key Features

1. **Draft Persistence**
   - Auto-save on field change
   - Step navigation saves state
   - Periodic background saves
   - Browser event handling

2. **Validation**
   - Real-time field validation
   - Step completion requirements
   - JSON schema validation
   - URL format validation

3. **User Experience**
   - Horizontal stepper navigation
   - Progress indicators
   - Keyboard navigation
   - Responsive design
   - Accessibility compliance

4. **Error Handling**
   - Network error recovery
   - Validation error display
   - Retry mechanisms
   - User-friendly messages