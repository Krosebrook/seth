# Contributing to SETH

Thank you for your interest in contributing to SETH! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)
10. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, identity, or experience level.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what's best for the project and community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insults, or personal attacks
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

1. **Development Environment**
   - Node.js 18+ and npm
   - Git
   - Code editor (VS Code recommended)
   - Base44 account for testing

2. **Recommended VS Code Extensions**
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/seth.git
   cd seth
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Krosebrook/seth.git
   ```

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_BASE44_APP_BASE_URL=https://your-instance.base44.com
   BASE44_LEGACY_SDK_IMPORTS=true
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Verify the app runs at `http://localhost:5173`

---

## Development Workflow

### Branch Strategy

We follow a feature branch workflow:

```
main (stable, production-ready)
  └── feature/your-feature-name
  └── fix/bug-description
  └── docs/documentation-update
  └── refactor/code-improvement
```

### Creating a Feature Branch

```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Working on Your Feature

1. Make your changes
2. Test thoroughly
3. Commit with clear messages
4. Push to your fork
5. Open a Pull Request

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Force push if needed (only on your branch)
git push origin feature/your-feature-name --force
```

---

## Coding Standards

### JavaScript/React Guidelines

#### 1. **Component Structure**

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ComponentName - Brief description
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title to display
 * @param {Function} props.onAction - Callback function
 */
export default function ComponentName({ title, onAction }) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleEvent = () => {
    // Event handler logic
  };

  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
}

ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func
};
```

#### 2. **Naming Conventions**

- **Components**: PascalCase (`SettingsPanel`, `ThoughtBubble`)
- **Functions**: camelCase (`handleSubmit`, `generateImage`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_ENDPOINT`)
- **Files**: Match component name (`SettingsPanel.jsx`)
- **Hooks**: Start with `use` (`useAuth`, `useMobile`)

#### 3. **File Organization**

```
src/
├── components/
│   ├── seth/              # Feature-specific components
│   │   └── Component.jsx
│   └── ui/                # Reusable UI components
│       └── button.jsx
├── hooks/                 # Custom hooks
│   └── use-hook-name.jsx
├── lib/                   # Utilities and helpers
│   └── utils.js
├── pages/                 # Page components
│   └── PageName.jsx
└── api/                   # API clients
    └── client.js
```

#### 4. **Code Style**

**Functional Components with Hooks**:
```jsx
// ✅ Good
export default function MyComponent({ prop }) {
  const [state, setState] = useState(null);
  return <div>{prop}</div>;
}

// ❌ Avoid class components
class MyComponent extends React.Component { ... }
```

**Destructuring Props**:
```jsx
// ✅ Good
function Button({ onClick, children, variant = 'primary' }) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Avoid
function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

**Conditional Rendering**:
```jsx
// ✅ Good - Short circuit for simple conditions
{isLoading && <Spinner />}
{error && <ErrorMessage message={error} />}

// ✅ Good - Ternary for either/or
{isLoggedIn ? <Dashboard /> : <Login />}

// ❌ Avoid - Complex nested ternaries
{condition ? (thing1 ? a : b) : (thing2 ? c : d)}
```

**State Updates**:
```jsx
// ✅ Good - Functional updates when depending on previous state
setCount(prev => prev + 1);

// ✅ Good - Object spread for partial updates
setSettings(prev => ({ ...prev, theme: 'dark' }));

// ❌ Avoid - Direct mutation
state.value = newValue; // Won't trigger re-render
```

### Tailwind CSS Guidelines

**Class Organization**:
```jsx
// ✅ Good - Logical grouping
<div className="
  flex items-center justify-between gap-4
  p-4 rounded-lg
  bg-gray-800 border border-cyan-500/50
  hover:bg-gray-700 transition-colors
">

// ❌ Avoid - Random order
<div className="bg-gray-800 gap-4 flex rounded-lg p-4 hover:bg-gray-700">
```

**Use Tailwind Utilities**:
```jsx
// ✅ Good
<div className="text-xl font-bold text-cyan-300">

// ❌ Avoid inline styles
<div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#67e8f9' }}>
```

**Conditional Classes**:
```jsx
import { cn } from '@/lib/utils';

// ✅ Good - Use utility function
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)}>
```

### ESLint Rules

Run before committing:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Key Rules**:
- No unused variables
- No unused imports
- Consistent quote style (single quotes)
- Semicolons required
- No console.log in production (warnings only)

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (formatting, no logic change)
- **refactor**: Code restructuring (no feature/fix)
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (deps, config)
- **ci**: CI/CD changes

### Examples

```bash
# Feature
feat(chat): add message search functionality

Implement full-text search across chat history using fuzzy matching.
Users can now search by keywords or phrases.

Closes #123

# Bug Fix
fix(voice): handle missing speech recognition API

Add graceful fallback when Web Speech API is unavailable.
Shows user-friendly error message instead of crashing.

# Documentation
docs(readme): update installation instructions

Clarify Base44 setup steps and add troubleshooting section.

# Refactor
refactor(settings): extract slider component

Create reusable SettingSlider component to reduce duplication
in SettingsPanel.
```

### Commit Best Practices

1. **Atomic commits**: One logical change per commit
2. **Clear subjects**: Start with verb, max 50 chars
3. **Detailed bodies**: Explain why, not what (code shows what)
4. **Reference issues**: Link to GitHub issues/PRs
5. **Test before commit**: Ensure code works

---

## Pull Request Process

### Before Opening a PR

- [ ] Code follows style guidelines
- [ ] All tests pass (when available)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation updated (if needed)
- [ ] Commits follow convention
- [ ] Branch is up-to-date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123, relates to #456

## Testing
How was this tested? What browsers/devices?

## Screenshots (if applicable)
Attach images/videos of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (when applicable)
```

### Review Process

1. **Automated checks** run (linting, build)
2. **Code review** by maintainer(s)
3. **Feedback** addressed and discussed
4. **Approval** and merge

### After Merge

- Delete your feature branch
- Close related issues
- Update local main branch

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

---

## Testing Guidelines

### Manual Testing

**Before submitting PR**:
1. Test on multiple browsers (Chrome, Firefox, Safari)
2. Test voice features (if modified)
3. Test all interaction modes
4. Check responsive design
5. Verify session persistence
6. Test error scenarios

### Future: Automated Testing

**Unit Tests** (Jest + React Testing Library):
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Integration Tests**:
- Test component interactions
- Mock Base44 SDK calls
- Verify state changes

**E2E Tests** (Playwright):
- Test complete user flows
- Verify multi-step interactions
- Check error handling

---

## Documentation

### Code Documentation

**JSDoc Comments for Functions**:
```javascript
/**
 * Generate enhanced image prompt using LLM
 * 
 * @param {string} userPrompt - User's original prompt
 * @returns {Promise<string>} Enhanced prompt for image generation
 * @throws {Error} If LLM call fails
 */
async function enhanceImagePrompt(userPrompt) {
  // Implementation
}
```

**Component Documentation**:
```jsx
/**
 * SettingsPanel - Configuration interface for SETH
 * 
 * Provides sliders and toggles for:
 * - Intelligence level (0-100)
 * - Voice settings (voice, pitch, speed)
 * - Content restrictions
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.settings - Current settings object
 * @param {Function} props.onSettingsChange - Callback for setting changes
 * @param {Function} props.onClose - Callback to close panel
 * @param {Array} props.voices - Available voice options
 */
```

### Documentation Updates

When changing code, update:
- Inline comments (for complex logic)
- README (for user-facing changes)
- ARCHITECTURE (for design changes)
- CHANGELOG (for version changes)

---

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Browser: [Chrome 120]
- OS: [Windows 11]
- SETH Version: [0.1.0]

**Additional context**
Any other relevant information
```

### Feature Requests

```markdown
**Feature Description**
Clear description of proposed feature

**Use Case**
Why is this needed? Who benefits?

**Proposed Solution**
How might this work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, references
```

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested
- `wontfix`: Will not be worked on

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, announcements
- **Pull Requests**: Code contributions

### Getting Help

- Check existing issues and documentation
- Ask in GitHub Discussions
- Tag maintainers if urgent (use sparingly)

### Recognition

Contributors are recognized in:
- CHANGELOG.md (for significant contributions)
- GitHub contributors page
- Special mentions in release notes

---

## Development Tips

### Debugging

**React DevTools**:
- Install browser extension
- Inspect component tree
- Track state changes

**Console Debugging**:
```javascript
// Temporary debugging (remove before commit)
console.log('Debug:', variable);
console.table(arrayOfObjects);
console.trace('Call stack');
```

**Vite DevTools**:
- Hot Module Replacement (HMR) for instant updates
- Error overlay in browser
- Source maps for debugging

### Common Issues

**Build Errors**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Import Errors**:
- Check path aliases in `jsconfig.json`
- Verify Base44 plugin configuration
- Ensure environment variables are set

**Styling Issues**:
- Verify Tailwind classes
- Check for conflicting styles
- Use browser DevTools to inspect

---

## Release Process (Maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch
4. Run full test suite
5. Build and test production bundle
6. Merge to main
7. Tag release: `git tag v0.1.0`
8. Push tag: `git push origin v0.1.0`
9. Create GitHub release
10. Deploy to production

---

## License

By contributing to SETH, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions not covered here, please:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to SETH! 🤖✨
