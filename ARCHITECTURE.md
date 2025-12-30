# SETH Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Security Architecture](#security-architecture)
10. [Performance Considerations](#performance-considerations)
11. [Scalability](#scalability)
12. [Deployment Architecture](#deployment-architecture)

---

## System Overview

SETH is a single-page application (SPA) built with React that provides an intelligent AI assistant interface. It leverages the Base44 platform for AI capabilities including LLM inference, image generation, and data persistence.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐ │
│  │  Chat Mode   │  Image Mode  │ Video Mode  │ Storyboard│ │
│  └──────────────┴──────────────┴──────────────┴───────────┘ │
│  ┌──────────────┬──────────────┬─────────────────────────┐  │
│  │   Settings   │   History    │    Voice Integration    │  │
│  └──────────────┴──────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────┬──────────────┬─────────────────────────┐  │
│  │ React State  │ TanStack Q.  │    Local Storage        │  │
│  └──────────────┴──────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Base44 SDK Layer                          │
│  ┌──────────────┬──────────────┬─────────────────────────┐  │
│  │  InvokeLLM   │ GenerateImg  │    Entity Storage       │  │
│  └──────────────┴──────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Base44 Platform                           │
│  ┌──────────────┬──────────────┬─────────────────────────┐  │
│  │  LLM Engine  │  Image Gen   │    Database/Storage     │  │
│  └──────────────┴──────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Component-Based Design
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Complex UIs built from simple, reusable components
- **Encapsulation**: Component logic and state contained within boundaries

### 2. Separation of Concerns
- **Presentation**: UI components in `src/components/`
- **Business Logic**: Processing in page components (`src/pages/`)
- **Data Access**: API layer in `src/api/`
- **Utilities**: Shared logic in `src/lib/` and `src/hooks/`

### 3. Declarative Programming
- React's declarative approach for UI rendering
- State-driven UI updates
- Functional components with hooks

### 4. Unidirectional Data Flow
- Props flow down from parent to child
- Events bubble up via callbacks
- Centralized state management where appropriate

### 5. Progressive Enhancement
- Core functionality works without advanced features
- Voice features gracefully degrade if unavailable
- Responsive design for various devices

---

## Technology Stack

### Frontend Framework
- **React 18.2.0**: Component-based UI library
- **React DOM**: Browser rendering
- **React Router 6.26.0**: Client-side routing

### Build Tools
- **Vite 6.1.0**: Fast build tool with HMR
- **@vitejs/plugin-react**: React support for Vite
- **@base44/vite-plugin**: Base44 SDK integration

### Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **PostCSS**: CSS transformation
- **Autoprefixer**: Vendor prefix automation
- **tailwindcss-animate**: Animation utilities

### UI Components
- **Radix UI**: Headless, accessible component primitives
  - Accordion, Dialog, Dropdown, Popover, Slider, Switch, Tabs, Toast, etc.
- **Lucide React**: Icon library
- **cmdk**: Command menu component

### State Management
- **React Hooks**: useState, useEffect, useRef, etc.
- **TanStack Query 5.84.1**: Server state management and caching
- **React Context**: Global state (Auth, Theme)

### Animation
- **Framer Motion 11.16.4**: Animation library
- **canvas-confetti**: Celebration effects

### Data Visualization
- **Recharts**: Charting library

### Form Handling
- **React Hook Form 7.54.2**: Form state management
- **Zod 3.24.2**: Schema validation
- **@hookform/resolvers**: Validation integration

### AI/Backend Integration
- **@base44/sdk 0.8.3**: Base44 platform SDK
- **Base44 Entities**: Learning, ChatSession

### Utilities
- **lodash**: Utility functions
- **date-fns**: Date manipulation
- **moment**: Alternative date library
- **clsx / tailwind-merge**: Conditional class names
- **class-variance-authority**: Component variant management

### Development Tools
- **ESLint 9.19.0**: Code linting
- **TypeScript 5.8.2**: Type checking (jsconfig.json)
- **@types/node, @types/react**: Type definitions

---

## System Architecture

### Layer Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │  UI Components, Pages
├─────────────────────────────────────────┤
│       Application Logic Layer            │  Hooks, Utils, Helpers
├─────────────────────────────────────────┤
│       Integration Layer                  │  Base44 SDK, API Client
├─────────────────────────────────────────┤
│       External Services                  │  Base44 Platform, Web APIs
└─────────────────────────────────────────┘
```

### Module Dependency Graph

```
main.jsx
  └─→ App.jsx
       ├─→ AuthContext (AuthProvider)
       ├─→ QueryClientProvider
       ├─→ Router (BrowserRouter)
       │    └─→ Routes
       │         └─→ SETH.jsx (Main Page)
       │              ├─→ SettingsPanel
       │              ├─→ HistoryPanel
       │              ├─→ ThoughtBubble
       │              ├─→ UI Components
       │              └─→ Base44 SDK
       │                   ├─→ InvokeLLM
       │                   ├─→ GenerateImage
       │                   └─→ Entities (Learning, ChatSession)
       ├─→ NavigationTracker
       ├─→ VisualEditAgent
       └─→ Toaster

base44Client.js
  └─→ @base44/sdk (createClient)
       └─→ app-params (config)
```

---

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── AuthenticatedApp
│       ├── Routes
│       │   ├── SETH (Main Page)
│       │   │   ├── Header
│       │   │   │   ├── HistoryButton → HistoryPanel
│       │   │   │   ├── ConsciousnessOrb
│       │   │   │   └── SettingsButton → SettingsPanel
│       │   │   ├── ModeSelector
│       │   │   ├── MessageList
│       │   │   │   └── Message
│       │   │   │       ├── ThoughtBubble (conditional)
│       │   │   │       ├── Avatar (Bot/User)
│       │   │   │       ├── MessageText
│       │   │   │       └── MessageImage (conditional)
│       │   │   └── InputFooter
│       │   │       ├── VoiceButton
│       │   │       ├── TextInput
│       │   │       └── SubmitButton
│       │   └── PageNotFound (fallback)
│       └── Layout
├── NavigationTracker
├── VisualEditAgent
└── Toaster
```

### Key Component Responsibilities

#### **SETH.jsx** (Main Container)
- **State Management**: Messages, session, settings, active mode
- **Mode Orchestration**: Chat, image, video, storyboard routing
- **Voice Integration**: Speech recognition and synthesis
- **API Coordination**: Calls to Base44 services
- **Learning System**: Extract and persist knowledge
- **Session Persistence**: Auto-save conversations

#### **SettingsPanel.jsx** (Configuration UI)
- **Props**: `settings`, `onSettingsChange`, `onClose`, `voices`
- **Responsibilities**:
  - Display configuration sliders and toggles
  - Handle user input and validate ranges
  - Emit setting changes to parent
  - Manage panel visibility animation

#### **HistoryPanel.jsx** (Session Management)
- **Props**: `onNewChat`, `onLoadSession`, `onClose`
- **Responsibilities**:
  - Fetch and display chat sessions
  - Handle session selection
  - Trigger new chat creation
  - Manage panel visibility animation

#### **ThoughtBubble.jsx** (Cognitive Display)
- **Props**: `text` (thought process string)
- **Responsibilities**:
  - Parse thought text into bullet points
  - Display animated thought process
  - Conditional rendering based on presence

---

## Data Flow

### User Input Flow

```
User Action (Text/Voice)
  ↓
Input Component State Update
  ↓
Form Submit / Mode Selection
  ↓
handleModeBasedGeneration()
  ↓
├─→ generateSingleImage()    [Image Mode]
├─→ generateStoryboard()     [Storyboard Mode]
├─→ handleVideoRequest()     [Video Mode]
└─→ handleChatMessage()      [Chat Mode]
     ↓
Base44 SDK API Call
  ├─→ InvokeLLM({ prompt, add_context_from_internet })
  └─→ GenerateImage({ prompt })
     ↓
Response Processing
  ├─→ Format message object
  ├─→ Update messages state
  ├─→ Trigger voice synthesis
  └─→ Learn from interaction
       ↓
Session Persistence
  └─→ ChatSession.create/update()
```

### Learning Flow

```
AI Response Received
  ↓
learnFromInteraction(userText, aiText)
  ↓
InvokeLLM(extractFactPrompt)
  ↓
If fact extracted and not "null"
  ↓
Learning.create({ fact })
  ↓
Fact persisted to Base44 entity storage
  ↓
Future prompts include memory context
```

### Session Management Flow

```
App Initialization
  ↓
Load session list from ChatSession.list()
  ↓
User selects mode/sends message
  ↓
Create message objects
  ↓
API interaction & response
  ↓
saveChatSession(messages, title)
  ├─→ If currentSessionId exists
  │    └─→ ChatSession.update(id, { messages })
  └─→ Else
       └─→ ChatSession.create({ title, messages })
            └─→ Set currentSessionId
```

---

## State Management

### Local Component State (useState)

Used for:
- UI state (loading, listening, panel visibility)
- Form inputs
- Transient data

**Example**:
```javascript
const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [showSettings, setShowSettings] = useState(false);
```

### React Context

Used for:
- **AuthContext**: User authentication state
- **ThemeContext** (via next-themes): Dark/light mode

**Benefits**:
- Avoid prop drilling
- Global state accessible anywhere
- Provider pattern for scoped state

### TanStack Query (React Query)

Used for:
- Server state caching
- Background refetching
- Request deduplication
- Optimistic updates

**Configuration** (`query-client.js`):
```javascript
export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});
```

### Session Storage / Local Storage

Used for:
- Persistent settings (via browser storage)
- Authentication tokens (managed by Base44 SDK)
- Cache for offline capability (future)

---

## API Integration

### Base44 SDK Architecture

```
Application Code
  ↓
base44Client.js (createClient)
  ↓
@base44/sdk
  ├─→ InvokeLLM (LLM Inference)
  ├─→ GenerateImage (Image Generation)
  └─→ Entity Methods (CRUD operations)
       ├─→ Learning.list/create
       └─→ ChatSession.list/get/create/update
  ↓
Base44 Vite Plugin (legacySDKImports)
  ├─→ @/integrations/Core → Base44 methods
  └─→ @/entities/* → Base44 entities
  ↓
HTTP Requests (handled internally by SDK)
  ↓
Base44 Platform API
```

### API Methods

#### **InvokeLLM**
```javascript
InvokeLLM({
  prompt: string,
  add_context_from_internet: boolean,
  response_json_schema?: object
})
```

**Use Cases**:
- Chat responses with internet context
- Image prompt enhancement
- Storyboard scene generation
- Learning fact extraction

#### **GenerateImage**
```javascript
GenerateImage({
  prompt: string
})
```

**Returns**: `{ url: string }`

**Use Cases**:
- Single image generation
- Storyboard scene visuals

#### **Entity Operations**

**Learning Entity**:
```javascript
Learning.list() → Array<{ id, fact, created_date }>
Learning.create({ fact }) → { id, ... }
```

**ChatSession Entity**:
```javascript
ChatSession.list(sort, limit) → Array<Session>
ChatSession.get(id) → Session
ChatSession.create({ title, messages }) → Session
ChatSession.update(id, { messages }) → Session
```

### Error Handling

**Strategy**: Graceful degradation with user-friendly messages

```javascript
try {
  const response = await InvokeLLM({ ... });
} catch (error) {
  console.error("API Error:", error);
  const fallbackMessage = {
    sender: 'ai',
    text: "I've encountered a technical challenge..."
  };
  setMessages([...messages, fallbackMessage]);
  speak(fallbackMessage.text);
}
```

---

## Security Architecture

### Authentication

- **Managed by**: Base44 SDK and AuthContext
- **Flow**:
  1. App checks public settings and auth status
  2. If auth required and not authenticated → redirect to login
  3. If user not registered → show registration error
  4. Token stored and managed by SDK

### Content Security

- **Unrestricted Mode**: Toggle for NSFW content
  - Default: OFF
  - When enabled: Removes content generation restrictions
  - User responsibility acknowledged in UI

### Input Sanitization

- **Current**: Minimal (relies on Base44 SDK)
- **Recommendation**: Add input validation for:
  - Maximum prompt length
  - Forbidden characters/patterns
  - Rate limiting on client side

### API Security

- **Token-based auth**: Managed by Base44 SDK
- **HTTPS**: Required for production
- **CORS**: Configured on Base44 platform

### Data Privacy

- **Session Data**: Stored in Base44 entity storage
- **Learning Data**: User-specific facts persist
- **Voice Data**: Processed client-side (Web Speech API)
- **No external tracking**: Analytics not yet implemented

### Vulnerabilities

**Current NPM Audit** (8 vulnerabilities):
- 6 moderate
- 2 high
- Primarily in dev dependencies (not production runtime)

**Recommendation**: Run `npm audit fix` regularly

---

## Performance Considerations

### Optimization Strategies

#### 1. **Code Splitting**
- Vite's automatic code splitting
- Lazy loading for routes (future enhancement)
- Dynamic imports for heavy components

#### 2. **React Optimization**
- `useCallback` for event handlers (future)
- `useMemo` for expensive computations (future)
- `React.memo` for component memoization (future)

#### 3. **Asset Optimization**
- Vite's built-in minification
- Tree-shaking for unused code
- Image optimization (manual)

#### 4. **Network Optimization**
- TanStack Query caching reduces API calls
- Debouncing user input (not yet implemented)
- Request deduplication via React Query

#### 5. **Rendering Optimization**
- Framer Motion's optimized animations
- Virtual scrolling for long message lists (future)
- Pagination for history panel (implemented: 50 items)

### Performance Metrics (Target)

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | Not measured |
| Time to Interactive | < 3s | Not measured |
| Lighthouse Score | > 90 | Not measured |
| Bundle Size | < 500KB (gzipped) | Not measured |

### Bottlenecks

1. **LLM API Latency**: 2-10s response time
   - Mitigation: Loading states, optimistic UI updates
2. **Image Generation**: 5-20s per image
   - Mitigation: Progressive loading, status messages
3. **Large Sessions**: 100+ messages slow to render
   - Future: Virtual scrolling, pagination
4. **Voice Synthesis**: Blocks UI during speech
   - Current: Acceptable for user experience

---

## Scalability

### Current Limitations

1. **Client-Side Only**: No backend beyond Base44
2. **Single User Sessions**: No collaboration
3. **No Caching Strategy**: Beyond React Query
4. **No CDN**: Static assets served from origin

### Horizontal Scalability

SETH is a static SPA that scales via:
- **CDN Distribution**: Serve from edge locations
- **Base44 Platform**: Scales backend automatically
- **Stateless Design**: Each session independent

### Vertical Scalability

Limited by:
- Browser memory for large sessions
- Web Speech API limitations
- Base44 platform rate limits

### Future Enhancements

1. **Service Worker**: Offline capability, caching
2. **IndexedDB**: Local persistence for large sessions
3. **Lazy Loading**: Load components on demand
4. **Streaming Responses**: Display LLM output incrementally
5. **Multi-tenancy**: User-specific workspaces

---

## Deployment Architecture

### Build Process

```
Source Code (src/)
  ↓
Vite Build (npm run build)
  ├─→ Tree-shaking
  ├─→ Minification
  ├─→ Code splitting
  └─→ Asset optimization
  ↓
dist/ (production bundle)
  ├─→ index.html
  ├─→ assets/
  │    ├─→ *.js (chunks)
  │    ├─→ *.css
  │    └─→ *.svg/png
  └─→ manifest.json
```

### Deployment Options

#### 1. **Static Hosting** (Recommended)
- **Platforms**: Vercel, Netlify, AWS S3+CloudFront, GitHub Pages
- **Advantages**: Simple, fast, scalable, cost-effective
- **Requirements**: 
  - Configure Base44 API URL
  - Set environment variables
  - Enable client-side routing (SPA fallback)

#### 2. **Container Deployment**
- **Docker**: Nginx serving static files
- **Kubernetes**: For enterprise scale
- **Advantages**: Portable, reproducible, orchestration

#### 3. **Traditional Server**
- **Apache/Nginx**: Serve static files
- **Advantages**: Full control, custom configuration

### Environment Configuration

**Development**:
```env
VITE_BASE44_APP_BASE_URL=http://localhost:3000
BASE44_LEGACY_SDK_IMPORTS=true
```

**Production**:
```env
VITE_BASE44_APP_BASE_URL=https://api.yourapp.base44.com
BASE44_LEGACY_SDK_IMPORTS=true
```

### CI/CD Pipeline (Future)

```
Git Push
  ↓
GitHub Actions Trigger
  ├─→ Install Dependencies
  ├─→ Run Linter
  ├─→ Run Tests
  ├─→ Build Production Bundle
  ├─→ Run Security Audit
  └─→ Deploy to Platform
       ├─→ Staging (feature branches)
       └─→ Production (main branch)
  ↓
Post-Deployment
  ├─→ Smoke Tests
  ├─→ Notify Team
  └─→ Update Changelog
```

---

## Design Patterns

### 1. **Container/Presenter Pattern**
- **Container** (SETH.jsx): Manages state and logic
- **Presenter** (Settings/History panels): Pure UI rendering

### 2. **Higher-Order Components**
- AuthProvider wraps app for auth context
- QueryClientProvider for React Query

### 3. **Render Props / Hooks**
- Custom hooks for reusable logic
- Children props for flexible composition

### 4. **Factory Pattern**
- Mode configuration in `getModeConfig()`
- Dynamic component selection

### 5. **Observer Pattern**
- React state updates trigger re-renders
- Event listeners for voice recognition

### 6. **Strategy Pattern**
- Different handling strategies per mode
- `handleModeBasedGeneration()` router

---

## Testing Strategy (Future)

### Unit Tests
- Component rendering
- Utility functions
- Hooks behavior

### Integration Tests
- API integration
- State management flows
- Form submissions

### End-to-End Tests
- User journeys
- Multi-mode interactions
- Session management

### Tools
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: E2E testing

---

## Monitoring & Observability (Future)

### Metrics to Track
- User engagement (sessions, messages)
- Mode usage distribution
- API response times
- Error rates
- Voice feature adoption

### Tools
- **Sentry**: Error tracking
- **Google Analytics**: Usage analytics
- **LogRocket**: Session replay
- **DataDog**: Performance monitoring

---

## Conclusion

SETH's architecture is built on modern React patterns with a clear separation of concerns. The Base44 SDK provides a robust backend, while the frontend focuses on user experience and intelligent interactions. The architecture is designed for maintainability, extensibility, and future scalability.

For implementation details, see:
- [README.md](README.md) - Getting started
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide
- [ROADMAP.md](ROADMAP.md) - Future plans
