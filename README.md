# SETH - Advanced AI Assistant Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Base44](https://img.shields.io/badge/powered%20by-Base44-00ffff.svg)](https://base44.com)

> **S**ophisticated **E**nhanced **T**hinking **H**ub - A multi-modal AI assistant with consciousness visualization, learning capabilities, and creative generation modes.

## 🌟 Overview

SETH is an advanced AI assistant platform built on the Base44 SDK, featuring multiple interaction modes, persistent learning, and a futuristic interface. It provides chat, image generation, video planning, and storyboarding capabilities with voice synthesis and session management.

### Key Features

- 🗣️ **Multi-Modal Interaction**
  - Chat mode with internet-augmented responses
  - Image generation with enhanced prompts
  - Storyboard creation for visual narratives
  - Video concept planning
  
- 🧠 **Adaptive Intelligence**
  - Adjustable intelligence and consciousness levels
  - Persistent learning from conversations
  - Context-aware responses with memory
  
- 🎤 **Voice Integration**
  - Speech-to-text input via Web Speech API
  - Text-to-speech output with customizable voices
  - Adjustable pitch, speed, and auto-speak settings
  
- 💾 **Session Management**
  - Persistent chat history
  - Session restoration
  - Automatic save and sync
  
- ⚙️ **Customizable Settings**
  - Intelligence level control
  - Voice configuration
  - Response length adjustment
  - Unrestricted mode toggle
  - Consciousness visualization intensity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Base44 account and API credentials
- Modern browser with Web Speech API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/seth.git
   cd seth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Base44 credentials**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_BASE44_APP_BASE_URL=https://your-base44-instance.base44.com
   BASE44_LEGACY_SDK_IMPORTS=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE44_APP_BASE_URL` | Base44 API endpoint URL | Yes |
| `BASE44_LEGACY_SDK_IMPORTS` | Enable legacy SDK import paths | Yes |

## 📖 Usage

### Basic Chat

1. Navigate to the SETH interface
2. Type your message or click the microphone icon for voice input
3. Press Send or Enter to submit
4. SETH will respond with intelligent, context-aware answers

### Image Generation

1. Click the "Image" mode button
2. Describe the image you want to generate
3. SETH will enhance your prompt and generate a high-quality image

### Storyboard Creation

1. Click the "Storyboard" mode button
2. Describe your narrative or concept
3. SETH will break it into 4-6 scenes with generated visuals

### Settings Configuration

Click the Settings icon to adjust:
- **Intelligence Level**: Controls cognitive sophistication (0-100)
- **Consciousness**: UI visualization intensity (0-100)
- **Voice Settings**: Select voice, speed, pitch, and auto-speak
- **Answer Length**: Brief, moderate, or detailed responses
- **Unrestricted Mode**: Enable NSFW content generation (use responsibly)

### Session History

- Click the History icon to view past conversations
- Click any session to restore it
- Click "New Chat" to start fresh

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 with Vite
- **UI Framework**: Tailwind CSS with Radix UI components
- **State Management**: React hooks and TanStack Query
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **AI Backend**: Base44 SDK (LLM integration and image generation)
- **Voice**: Web Speech API

### Project Structure

```
seth/
├── src/
│   ├── api/                 # API client configuration
│   │   └── base44Client.js  # Base44 SDK initialization
│   ├── components/
│   │   ├── seth/            # SETH-specific components
│   │   │   ├── HistoryPanel.jsx      # Chat session history
│   │   │   ├── SettingsPanel.jsx     # Configuration UI
│   │   │   └── ThoughtBubble.jsx     # Cognitive process display
│   │   └── ui/              # Reusable UI components (Radix-based)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   │   ├── AuthContext.jsx           # Authentication provider
│   │   ├── NavigationTracker.jsx     # Route tracking
│   │   ├── VisualEditAgent.jsx       # Visual editing mode
│   │   ├── app-params.js             # App configuration
│   │   ├── query-client.js           # TanStack Query setup
│   │   └── utils.js                  # Helper functions
│   ├── pages/
│   │   └── SETH.jsx         # Main SETH interface
│   ├── App.jsx              # Root application component
│   ├── Layout.jsx           # Global layout and styling
│   ├── main.jsx             # Application entry point
│   └── pages.config.js      # Page routing configuration
├── public/                  # Static assets
├── .gitignore              # Git ignore patterns
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite build configuration
```

### Core Components

#### SETH.jsx
The main interface component orchestrating all modes, state management, and user interactions. Handles:
- Message state and session management
- Mode switching (chat, image, video, storyboard)
- Voice recognition and synthesis
- API calls to Base44 services
- Learning and memory integration

#### SettingsPanel.jsx
Configuration interface for customizing SETH's behavior:
- Intelligence and consciousness sliders
- Voice selection and parameters
- Response length preferences
- Content restriction toggles

#### HistoryPanel.jsx
Session management UI providing:
- List of past conversations
- Session loading and restoration
- New chat initialization

### Data Flow

1. **User Input** → Input component or voice recognition
2. **Mode Detection** → Active mode determines processing path
3. **API Call** → Base44 SDK methods (InvokeLLM, GenerateImage)
4. **Response Processing** → Format and display results
5. **Learning** → Extract facts and update knowledge base
6. **Session Save** → Persist to ChatSession entity
7. **Voice Output** → Text-to-speech synthesis (if enabled)

### Base44 Integration

SETH uses the Base44 SDK for:
- **LLM Inference**: `InvokeLLM` with internet context augmentation
- **Image Generation**: `GenerateImage` with optimized prompts
- **Entity Storage**: `Learning` and `ChatSession` entities
- **Authentication**: Managed via `AuthContext`

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Auto-fix ESLint issues |

### Code Style

- Follow React best practices and hooks guidelines
- Use functional components with hooks
- Maintain consistent Tailwind CSS utility ordering
- Use semantic HTML and accessibility attributes
- Document complex logic with comments

### Testing

Currently, the project uses manual testing. See [ROADMAP.md](ROADMAP.md) for planned test infrastructure.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push to your fork: `git push origin feature/your-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Base44](https://base44.com) - AI application platform
- UI components powered by [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## 📚 Additional Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [ROADMAP.md](ROADMAP.md) - Future development plans

## 🐛 Known Issues

See [GitHub Issues](https://github.com/Krosebrook/seth/issues) for current bugs and feature requests.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/seth/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/seth/discussions)
- **Base44 Docs**: [docs.base44.com](https://docs.base44.com)

---

**Made with 🤖 by the SETH Team**
