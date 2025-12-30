# SETH Modules & Components Documentation

This document provides detailed information about each module, component, and agent in the SETH codebase.

## Table of Contents

1. [Core Modules](#core-modules)
2. [SETH-Specific Components](#seth-specific-components)
3. [Agents](#agents)
4. [Context Providers](#context-providers)
5. [Utility Libraries](#utility-libraries)
6. [API Integration](#api-integration)
7. [Hooks](#hooks)

---

## Core Modules

### SETH.jsx

**Location**: `src/pages/SETH.jsx`

**Purpose**: Main application interface and orchestration layer for all AI interaction modes.

**Responsibilities**:
- Manage conversation state and message history
- Orchestrate different interaction modes (chat, image, video, storyboard)
- Handle voice recognition and text-to-speech synthesis
- Coordinate with Base44 SDK for AI operations
- Implement learning system for knowledge persistence
- Manage session persistence and restoration

**Key Features**:
- **Multi-modal routing**: Dispatches user input to appropriate handler based on active mode
- **Voice integration**: Speech-to-text input and text-to-speech output
- **Learning system**: Extracts and persists important facts from conversations
- **Session management**: Auto-saves conversations to ChatSession entity
- **Error handling**: Graceful fallbacks with user-friendly messages

**State Variables**:
```javascript
messages          // Array of message objects (user/ai, text/image)
currentSessionId  // ID of active chat session
input            // Current user input text
isLoading        // API call in progress
isListening      // Voice recognition active
showSettings     // Settings panel visibility
showHistory      // History panel visibility
activeMode       // Current mode (chat/image/video/storyboard)
settings         // User preferences object
voices           // Available TTS voices
```

**Key Functions**:
- `handleModeBasedGeneration()`: Routes input to appropriate mode handler
- `generateSingleImage()`: Enhanced image generation with prompt optimization
- `generateStoryboard()`: Multi-scene visual narrative creation
- `handleVideoRequest()`: Video concept planning (placeholder)
- `handleChatMessage()`: LLM conversation with internet context
- `learnFromInteraction()`: Extract and persist knowledge
- `saveChatSession()`: Persist conversation to entity storage
- `speak()`: Text-to-speech synthesis with voice settings

**Input/Output**:
- **Input**: User text or voice, mode selection, settings
- **Output**: AI responses, generated images, thought processes, voice synthesis

**Decision Logic**:
1. User submits input → Detect active mode
2. Route to appropriate handler (chat/image/video/storyboard)
3. Call Base44 SDK methods (InvokeLLM or GenerateImage)
4. Process response and update UI
5. Extract learning facts (async)
6. Save session to persistence layer
7. Trigger voice output if enabled

**Edge Cases**:
- API timeout/failure: Show fallback message, continue operation
- Voice API unavailable: Graceful alert, disable voice features
- Large sessions: May slow render (future: virtual scrolling)
- Empty responses: Handle null/undefined from API

---

## SETH-Specific Components

### SettingsPanel.jsx

**Location**: `src/components/seth/SettingsPanel.jsx`

**Purpose**: Configuration UI for customizing SETH's behavior and appearance.

**Props**:
```javascript
settings          // Object: Current settings state
onSettingsChange  // Function: Callback for setting updates
onClose          // Function: Callback to close panel
voices           // Array: Available TTS voice options
```

**Responsibilities**:
- Display configuration sliders and toggles
- Handle user input with validation
- Emit setting changes to parent component
- Manage panel visibility animations

**Settings Managed**:
- **Intelligence Level** (0-100): Cognitive sophistication
- **Consciousness** (0-100): UI visualization intensity
- **Voice Selection**: TTS voice from browser options
- **Auto-speak**: Toggle for automatic voice output
- **Voice Speed** (0-100): TTS rate
- **Voice Pitch** (0-100): TTS pitch
- **Answer Length** (0-100): Response detail level
- **Unrestricted Mode**: Toggle for NSFW content

**Input/Output**:
- **Input**: Settings object, voice array
- **Output**: Updated settings via callback

**Animation**: Slides in from right with Framer Motion spring animation

---

### HistoryPanel.jsx

**Location**: `src/components/seth/HistoryPanel.jsx`

**Purpose**: Display and manage chat session history.

**Props**:
```javascript
onNewChat       // Function: Callback to start new chat
onLoadSession   // Function: Callback to load session by ID
onClose        // Function: Callback to close panel
```

**Responsibilities**:
- Fetch and display list of past chat sessions
- Handle session selection for restoration
- Trigger new chat creation
- Manage panel visibility animations

**Data Flow**:
1. Component mounts → Fetch sessions via `ChatSession.list()`
2. Display sessions sorted by creation date (newest first)
3. User clicks session → Call `onLoadSession(sessionId)`
4. Parent loads session data and updates messages

**Input/Output**:
- **Input**: None (fetches from entity storage)
- **Output**: Session selection via callback

**Animation**: Slides in from left with Framer Motion spring animation

---

### ThoughtBubble.jsx

**Location**: `src/components/seth/ThoughtBubble.jsx`

**Purpose**: Display AI's cognitive process and reasoning steps.

**Props**:
```javascript
text  // String: Raw thought process text
```

**Responsibilities**:
- Parse thought text into structured bullet points
- Animate bullet point reveals sequentially
- Conditionally render based on text presence

**Processing Logic**:
1. Remove common headers (e.g., "Internal Monologue:", "Thinking:")
2. Split by newlines
3. Clean up list markers (e.g., "- ", "1. ")
4. Filter empty lines
5. Render as animated list

**Input/Output**:
- **Input**: Unstructured thought text
- **Output**: Structured, animated thought display

**Animation**: Sequential bullet point reveals with staggered delays

---

## Agents

### VisualEditAgent.jsx

**Location**: `src/lib/VisualEditAgent.jsx`

**Purpose**: Enable visual editing mode for UI components when embedded in an iframe (Base44 platform feature).

**Responsibilities**:
- Listen for messages from parent window to toggle visual edit mode
- Detect hover and click events on elements with `data-source-location` or `data-visual-selector-id`
- Display visual overlays on hovered/selected elements
- Send element information to parent window on selection
- Receive and apply class/content updates from parent
- Handle scroll events to update element positions

**Message Types**:

**Incoming** (from parent):
- `toggle-visual-edit-mode`: Enable/disable edit mode
- `update-classes`: Update element classes
- `update-content`: Update element text content
- `unselect-element`: Clear current selection
- `refresh-page`: Reload the page
- `request-element-position`: Send current element position
- `popover-drag-state`: Handle popover drag conflicts
- `dropdown-state`: Handle dropdown open/close

**Outgoing** (to parent):
- `visual-edit-agent-ready`: Signal agent is initialized
- `element-selected`: Send selected element data
- `element-position-update`: Send element position for popover
- `close-dropdowns`: Request dropdown closure

**Key Features**:
- **Multi-element support**: Handles multiple elements with same ID
- **Overlay system**: Visual feedback with labeled borders
- **Position tracking**: Updates overlays on scroll/resize
- **Mutation observer**: Detects DOM changes and repositions overlays
- **Cursor change**: Crosshair cursor in edit mode

**Input/Output**:
- **Input**: PostMessage events from parent, DOM events (hover, click, scroll)
- **Output**: PostMessage events to parent, DOM overlays

**Decision Logic**:
1. Parent enables visual edit mode → Add event listeners, change cursor
2. User hovers element → Find all matching elements, show overlays
3. User clicks element → Select, send data to parent, persist selection
4. Parent sends class update → Apply to all matching elements, reposition overlays
5. Scroll/resize occurs → Update overlay positions
6. Parent disables edit mode → Remove listeners, clear overlays

**Note**: This agent is specific to Base44 platform's visual editing feature and does not affect normal SETH usage.

---

## Context Providers

### AuthContext.jsx

**Location**: `src/lib/AuthContext.jsx`

**Purpose**: Manage authentication state and provide auth utilities throughout the app.

**Responsibilities**:
- Check app public settings and authentication status
- Handle loading states during auth verification
- Provide navigation to login when auth required
- Handle user not registered errors
- Expose auth state to all components

**Context Value**:
```javascript
{
  isLoadingAuth,           // Boolean: Auth check in progress
  isLoadingPublicSettings, // Boolean: Settings check in progress
  authError,              // Object: Error details (type, message)
  navigateToLogin,        // Function: Redirect to login
}
```

**Error Types**:
- `user_not_registered`: User needs to complete registration
- `auth_required`: User must log in

**Usage**:
```javascript
const { isLoadingAuth, authError } = useAuth();
```

---

## Utility Libraries

### utils.js

**Location**: `src/lib/utils.js`

**Purpose**: Utility functions for common operations.

**Key Functions**:
- `cn()`: Merge Tailwind CSS classes with conflict resolution (uses `clsx` and `tailwind-merge`)

**Usage**:
```javascript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)} />
```

---

### app-params.js

**Location**: `src/lib/app-params.js`

**Purpose**: Extract and provide app configuration parameters.

**Exports**:
```javascript
{
  appId,            // String: Base44 app ID
  token,            // String: Auth token
  functionsVersion  // String: Functions version
}
```

**Usage**: Used by `base44Client.js` to initialize SDK.

---

### query-client.js

**Location**: `src/lib/query-client.js`

**Purpose**: Configure and export TanStack Query client instance.

**Configuration**:
```javascript
{
  refetchOnWindowFocus: false,  // Don't refetch when window gains focus
  retry: 1                      // Retry failed queries once
}
```

**Usage**: Wrap app in `QueryClientProvider` with this instance.

---

### NavigationTracker.jsx

**Location**: `src/lib/NavigationTracker.jsx`

**Purpose**: Track route changes for analytics purposes.

**Responsibilities**:
- Listen to route changes via React Router
- Log navigation events (future: send to analytics service)

**Note**: Currently logs to console; future integration with analytics platform planned.

---

### PageNotFound.jsx

**Location**: `src/lib/PageNotFound.jsx`

**Purpose**: Display 404 error page for invalid routes.

**Features**:
- User-friendly error message
- Link back to home page
- Styled to match SETH theme

---

## API Integration

### base44Client.js

**Location**: `src/api/base44Client.js`

**Purpose**: Initialize and export Base44 SDK client.

**Configuration**:
```javascript
createClient({
  appId,            // From app-params
  token,            // From app-params
  functionsVersion, // From app-params
  serverUrl: '',    // Empty for default
  requiresAuth: false // Public access
})
```

**Exports**:
- `base44`: Configured client instance

**Usage**:
```javascript
import { base44 } from '@/api/base44Client';
```

**Note**: Base44 SDK is extended via Vite plugin to support legacy import paths:
- `@/integrations/Core` → SDK methods (InvokeLLM, GenerateImage)
- `@/entities/Learning` → Learning entity
- `@/entities/ChatSession` → ChatSession entity

---

## Hooks

### use-mobile.jsx

**Location**: `src/hooks/use-mobile.jsx`

**Purpose**: Detect if user is on mobile device.

**Returns**: `boolean` - True if mobile breakpoint

**Implementation**: Uses `window.matchMedia` to check screen width.

**Usage**:
```javascript
const isMobile = useMobile();
```

---

## Component Architecture Patterns

### Container/Presenter Pattern

**Container Components** (Smart):
- `SETH.jsx`: Manages state and logic
- `App.jsx`: Orchestrates providers and routing

**Presenter Components** (Dumb):
- `SettingsPanel.jsx`: Pure UI rendering
- `HistoryPanel.jsx`: Display logic only
- `ThoughtBubble.jsx`: Formatting and display

### Composition Pattern

Components use children props and composition for flexibility:
```javascript
<Layout currentPageName={path}>
  <Page />
</Layout>
```

### Hook Pattern

Custom hooks extract reusable logic:
- `useAuth()`: Authentication state
- `useMobile()`: Responsive detection

**Future hooks** (planned):
- `useVoiceSynthesis()`: TTS logic
- `useVoiceRecognition()`: STT logic
- `useChatSession()`: Session management
- `useModeHandler()`: Mode-specific logic

---

## Data Models

### Message Object

```javascript
{
  sender: 'user' | 'ai',
  text: string,              // Message text
  imageUrl?: string,         // Generated image URL (optional)
  thought?: string           // AI reasoning process (optional)
}
```

### Settings Object

```javascript
{
  consciousness: number,      // 0-100
  intelligence: number,       // 0-100
  voice: string | null,       // Voice name
  answerLength: number,       // 0-100
  voiceSpeed: number,         // 0-100
  voicePitch: number,         // 0-100
  autoSpeak: boolean,         // Auto TTS
  unrestrictedMode: boolean   // NSFW toggle
}
```

### ChatSession Entity

```javascript
{
  id: string,
  title: string,              // First message excerpt
  messages: Message[],        // Array of message objects
  created_date: string        // ISO timestamp
}
```

### Learning Entity

```javascript
{
  id: string,
  fact: string,               // Learned knowledge
  created_date: string        // ISO timestamp
}
```

---

## Error Handling Strategy

### API Errors

**Pattern**: Try-catch with fallback messages
```javascript
try {
  const response = await InvokeLLM({ ... });
} catch (error) {
  console.error("API Error:", error);
  // Display user-friendly fallback message
  // Continue operation gracefully
}
```

**User Experience**:
- No abrupt crashes
- Friendly error messages
- Operation continues when possible
- Console logs for debugging

### Voice Errors

**Pattern**: Feature detection and alerts
```javascript
if (!recognition) {
  alert("Speech recognition is not supported by your browser.");
  return;
}
```

### Session Errors

**Pattern**: Silent failure with console logs
```javascript
try {
  await ChatSession.update(id, { messages });
} catch (error) {
  console.error("Session save failed:", error);
  // Don't disrupt user experience
}
```

---

## Performance Optimization Techniques

### Current

1. **React Hooks**: Efficient state updates
2. **TanStack Query**: Request deduplication and caching
3. **Framer Motion**: GPU-accelerated animations
4. **Vite**: Fast HMR and build optimization

### Planned (see ROADMAP.md)

1. **Code splitting**: Lazy load routes
2. **Virtual scrolling**: Handle large message lists
3. **Image lazy loading**: Load images on demand
4. **Service Worker**: Cache static assets
5. **Web Vitals monitoring**: Track performance metrics

---

## Security Considerations

### Authentication

- Managed by Base44 SDK and AuthContext
- Token-based authentication
- Redirect to login when required

### Input Sanitization

- Currently relies on Base44 SDK
- **Recommendation**: Add client-side validation
  - Max prompt length
  - Forbidden patterns
  - Rate limiting

### Content Safety

- Unrestricted mode toggle for NSFW
- Default: Content filters enabled
- User responsibility acknowledged in UI

### API Security

- Token-based auth via Base44
- HTTPS required in production
- CORS configured on Base44 platform

---

## Testing Strategy (Future)

### Unit Tests

**Components**:
- `SettingsPanel`: State management, event handlers
- `HistoryPanel`: Session loading, display logic
- `ThoughtBubble`: Text parsing, rendering

**Utils**:
- `cn()`: Class merging logic
- Custom hooks: Return values, side effects

### Integration Tests

**API Integration**:
- Mock Base44 SDK methods
- Test InvokeLLM flows
- Test GenerateImage flows
- Test entity operations

### E2E Tests

**User Flows**:
- Complete chat conversation
- Mode switching
- Settings persistence
- Session restoration
- Voice interaction

---

## Module Dependencies

### Dependency Graph

```
App.jsx
  ├─ AuthContext (Context Provider)
  ├─ QueryClientProvider (TanStack Query)
  ├─ Router (React Router)
  │   └─ SETH.jsx
  │       ├─ Base44 SDK (InvokeLLM, GenerateImage)
  │       ├─ Entities (Learning, ChatSession)
  │       ├─ SettingsPanel
  │       ├─ HistoryPanel
  │       ├─ ThoughtBubble
  │       └─ UI Components (Button, Input, etc.)
  ├─ NavigationTracker
  ├─ VisualEditAgent
  └─ Toaster (Toast notifications)
```

### External Dependencies

**Production**:
- React, React DOM, React Router
- Tailwind CSS, Radix UI
- Framer Motion
- TanStack Query
- Base44 SDK
- Web Speech API (browser)
- Lucide Icons
- Various utility libraries (lodash, date-fns, etc.)

**Development**:
- Vite, ESLint
- TypeScript (for type checking)
- PostCSS, Autoprefixer

---

## Configuration Files

### vite.config.js

**Purpose**: Vite build configuration

**Key Settings**:
- Base44 plugin with legacy SDK imports
- React plugin for JSX support
- HMR notifier

### tailwind.config.js

**Purpose**: Tailwind CSS configuration

**Customizations**:
- Extended color palette (cyan theme)
- Custom animations
- Dark mode support

### eslint.config.js

**Purpose**: Code linting rules

**Rules**:
- React best practices
- Unused imports detection
- Consistent code style

### jsconfig.json

**Purpose**: JavaScript/TypeScript configuration

**Settings**:
- Path aliases (`@/*` → `./src/*`)
- JSX support
- Type checking (checkJs: true)

### postcss.config.js

**Purpose**: CSS processing

**Plugins**:
- Tailwind CSS
- Autoprefixer

---

## Best Practices

### Component Design

1. **Single Responsibility**: Each component has one clear purpose
2. **Prop Types**: Document expected props (future: TypeScript)
3. **Error Boundaries**: Handle errors gracefully
4. **Accessibility**: ARIA labels, keyboard navigation

### State Management

1. **Local State First**: Use `useState` for component-specific state
2. **Context for Global**: Auth, theme via Context API
3. **Server State**: TanStack Query for API data
4. **Minimize Re-renders**: Use `useCallback`, `useMemo` when needed

### Code Style

1. **Consistent Naming**: camelCase functions, PascalCase components
2. **File Organization**: Group by feature, not type
3. **Comments**: Document complex logic, not obvious code
4. **Imports**: Absolute paths with `@/` alias

### Testing (Future)

1. **Test Behavior**: Not implementation details
2. **Integration Over Unit**: Test component interactions
3. **E2E for Critical Flows**: User journeys
4. **Mock External Deps**: API calls, browser APIs

---

## Future Enhancements

See [ROADMAP.md](ROADMAP.md) for detailed plans.

**Key Areas**:
1. **Refactoring**: Split SETH.jsx into custom hooks
2. **TypeScript**: Gradual migration for type safety
3. **Testing**: Comprehensive test suite
4. **Performance**: Bundle optimization, lazy loading
5. **Features**: New modes, integrations, collaboration

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new modules and components.

**When Adding a New Module**:
1. Follow existing patterns
2. Document purpose and responsibilities
3. Add to this file
4. Write tests (when test infrastructure exists)
5. Update CHANGELOG.md

---

**Last Updated**: 2024-12-30  
**Version**: 1.0  
**Maintainers**: SETH Development Team
