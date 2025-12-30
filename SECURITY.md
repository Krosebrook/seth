# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Current Security Status

### Known Vulnerabilities

As of the latest audit (2024-12-30), there are **8 npm package vulnerabilities**:

#### High Severity (2)
1. **jspdf** (v2.5.2)
   - CVE: GHSA-w532-jxjh-hjhj (ReDoS), GHSA-8mvj-3j78-4qmw (DoS)
   - Impact: Denial of Service attacks via malicious input
   - Fix Available: Upgrade to v3.0.4 (breaking change)
   - Status: Direct dependency, affects PDF export feature

2. **glob** (v10.4.5)
   - CVE: GHSA-5j98-mcp5-4vw2
   - Impact: Command injection via CLI (does not affect runtime)
   - Fix Available: Upgrade to v10.5.0+
   - Status: Development dependency only

#### Moderate Severity (6)
3. **dompurify** (<3.2.4)
   - CVE: GHSA-vhxf-7vqr-mrjg
   - Impact: Cross-site Scripting (XSS)
   - Fix Available: Via jspdf upgrade to v3.0.4
   - Status: Transitive dependency through jspdf

4. **js-yaml** (v4.1.0)
   - CVE: GHSA-mh29-5h37-fv8m
   - Impact: Prototype pollution in merge operator
   - Fix Available: Upgrade to v4.1.1+
   - Status: Development dependency

5. **mdast-util-to-hast** (v13.2.0)
   - CVE: GHSA-4fh9-h7wg-q85m
   - Impact: Unsanitized class attribute
   - Fix Available: Upgrade to v13.2.1+
   - Status: Transitive dependency through react-markdown

6. **quill** (v1.3.7)
   - CVE: GHSA-4943-9vgg-gr5r
   - Impact: Cross-site Scripting
   - Fix Available: Pending maintainer update
   - Status: Direct dependency via react-quill

7-8. **Additional moderate issues** in transitive dependencies

**Overall Assessment**: Most vulnerabilities are in development dependencies or non-critical features (PDF export, Markdown rendering). Core chat functionality is not affected.

**Action Required**: 
- Run `npm audit fix` to address non-breaking issues
- Evaluate upgrading jspdf to v3.0.4 (breaking change)
- Monitor quill for security updates

### Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix non-breaking issues
npm audit fix

# Fix all issues (may include breaking changes)
npm audit fix --force
```

## Security Best Practices

### Authentication & Authorization

- **Base44 SDK**: Handles authentication via token-based system
- **Token Storage**: Managed securely by Base44 SDK (not exposed in code)
- **Session Management**: Server-side session handling through Base44 platform
- **Auth Context**: React Context provides auth state without exposing credentials

**Recommendations**:
- Never commit `.env` files with credentials
- Rotate API tokens regularly
- Use environment-specific credentials

### Data Privacy

#### What Data is Stored

1. **Chat Sessions**: Conversation history (messages, timestamps)
2. **Learning Data**: User-specific facts extracted from conversations
3. **Settings**: User preferences (intelligence level, voice settings, etc.)
4. **Authentication**: Tokens and user identity (managed by Base44)

#### Where Data is Stored

- **Base44 Platform**: All persistent data (sessions, learning, user info)
- **Browser Local Storage**: Temporary settings and cache
- **Session Storage**: Ephemeral state during active session

#### Data Protection

- **Encryption in Transit**: HTTPS required for production
- **Encryption at Rest**: Handled by Base44 platform infrastructure
- **User Control**: Users can clear their data through browser settings
- **No Third-Party Tracking**: No analytics or tracking services (yet)

### Input Validation & Sanitization

#### Current Implementation

**Limited client-side validation**:
- Input length not restricted
- No pattern validation
- Relies on Base44 SDK for sanitization

**Recommendations for Future Versions**:

1. **Prompt Length Limits**:
```javascript
const MAX_PROMPT_LENGTH = 10000;

if (input.length > MAX_PROMPT_LENGTH) {
  showError("Prompt is too long. Please limit to 10,000 characters.");
  return;
}
```

2. **Character Whitelisting**:
```javascript
const FORBIDDEN_PATTERNS = [
  /\<script\>/gi,  // XSS attempts
  /javascript:/gi,  // Protocol injection
  /on\w+=/gi       // Event handlers
];

const isInputSafe = (text) => {
  return !FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
};
```

3. **Rate Limiting**:
```javascript
const RATE_LIMIT = {
  requests: 10,
  windowMs: 60000  // 1 minute
};

// Implement client-side throttling
```

### XSS (Cross-Site Scripting) Protection

#### Current Protection

- **React DOM**: Automatic escaping of user input in JSX
- **No `dangerouslySetInnerHTML`**: Used nowhere in codebase
- **Content Security Policy**: Not yet implemented

**Recommendations**:

1. **Add CSP Header** (server-side or meta tag):
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.base44.com;">
```

2. **Sanitize Markdown** (if added):
```javascript
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(dirtyHTML);
```

### API Security

#### Base44 SDK

- **Token-based authentication**: Secure, short-lived tokens
- **HTTPS only**: All API calls use encrypted connections
- **Rate limiting**: Handled by Base44 platform
- **CORS**: Configured on Base44 backend

#### Future Considerations

1. **Request Signing**: Add HMAC signatures for critical operations
2. **API Versioning**: Use versioned endpoints for backward compatibility
3. **Error Handling**: Don't expose internal errors to users

### Content Safety

#### Unrestricted Mode

**Risk**: Allows generation of NSFW/explicit content

**Mitigations**:
- Default: OFF
- Clear warning in settings panel
- Red color scheme for visual distinction
- User acknowledgment required

**Recommendations**:
- Add confirmation dialog when enabling
- Log unrestricted mode usage (for abuse detection)
- Add content moderation layer

**Example Enhancement**:
```javascript
const enableUnrestrictedMode = () => {
  const confirmed = window.confirm(
    "Unrestricted Mode allows NSFW content generation. " +
    "You are responsible for ensuring your use complies with applicable laws. " +
    "Continue?"
  );
  
  if (confirmed) {
    setSettings(prev => ({ ...prev, unrestrictedMode: true }));
    // Log event for audit trail
    console.warn("[Security] Unrestricted mode enabled", new Date());
  }
};
```

### Session Security

#### Current Implementation

- Sessions stored in Base44 entity storage
- No client-side encryption
- Session IDs not predictable (UUIDs)

#### Recommendations

1. **Session Timeout**: Auto-logout after inactivity
```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

useEffect(() => {
  let timeout;
  
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  };
  
  // Reset on user activity
  document.addEventListener('mousemove', resetTimeout);
  document.addEventListener('keypress', resetTimeout);
  
  return () => {
    clearTimeout(timeout);
    document.removeEventListener('mousemove', resetTimeout);
    document.removeEventListener('keypress', resetTimeout);
  };
}, []);
```

2. **Session Encryption**: Encrypt sensitive session data before storage

3. **Session Invalidation**: Implement logout and session clearing

### Voice Input Security

#### Risks

- Voice data processed by browser's Web Speech API
- Potential privacy concerns with audio recording
- No control over where audio is processed (browser-dependent)

#### Mitigations

- User must explicitly enable microphone
- Visual indicator when listening (pulsing red mic icon)
- Audio not stored or transmitted (handled by browser)
- Transcription only (no raw audio)

#### Recommendations

1. **Privacy Notice**:
```javascript
const enableVoiceInput = () => {
  const notice = "Voice input uses your browser's speech recognition. " +
                 "Audio may be processed by your browser vendor. Continue?";
  
  if (window.confirm(notice)) {
    recognition.start();
  }
};
```

2. **Opt-in Only**: Don't auto-enable on first use

### Image Generation Security

#### Risks

- Generated images may contain sensitive/inappropriate content
- Images stored and accessible via URLs
- No content filtering on generated images

#### Current Protections

- Prompt enhancement layer (adds "professional", "appropriate" keywords)
- Unrestricted mode toggle controls content filters

#### Recommendations

1. **Content Moderation**: Add image classification to detect NSFW content
2. **Watermarking**: Add subtle watermark to generated images
3. **Expiration**: Set TTL on image URLs to auto-delete after period
4. **Blur Toggle**: Add option to blur potentially sensitive images

### Dependency Security

#### Regular Audits

**Schedule**: 
- Weekly automated audits via CI/CD (future)
- Manual review before each release
- Immediate patching of critical vulnerabilities

**Process**:
```bash
# 1. Check for vulnerabilities
npm audit

# 2. Review severity and impact
npm audit --json > audit-report.json

# 3. Update vulnerable packages
npm update

# 4. If updates break, use audit fix
npm audit fix

# 5. For breaking changes, evaluate manually
npm audit fix --force  # Use with caution
```

#### Trusted Sources

- Only install packages from npm registry
- Verify package authenticity (check publisher, downloads, GitHub repo)
- Review package code for suspicious activity before adding
- Use `package-lock.json` to lock versions

#### Supply Chain Security

**Recommendations**:
1. **Snyk Integration**: Automated vulnerability scanning
2. **Dependabot**: Auto-create PRs for security updates
3. **License Compliance**: Check licenses of all dependencies
4. **Minimal Dependencies**: Remove unused packages

### Environment Variables

#### Sensitive Data

**Never commit**:
- API tokens
- Secret keys
- Database credentials
- Personal information

**Use `.env` files**:
```env
# .env (gitignored)
VITE_BASE44_APP_BASE_URL=https://api.example.com
BASE44_API_TOKEN=secret_token_here
```

**Verify `.gitignore`**:
```
# .gitignore
.env
.env.*
!.env.example
```

#### Environment-Specific Configs

- **Development**: Use test credentials, enable debug logs
- **Staging**: Production-like, use staging API
- **Production**: Real credentials, minimal logging, error tracking

### Browser Security

#### Local Storage

**What's Stored**:
- User preferences (settings)
- Temporary cache
- Session tokens (via Base44 SDK)

**Risks**:
- XSS attacks can read local storage
- No encryption by default
- Shared across tabs

**Mitigations**:
- Don't store highly sensitive data
- Clear storage on logout
- Use httpOnly cookies for critical tokens (future)

#### Cookies

**Currently**: Not used directly (Base44 SDK may use)

**Recommendations** (if implementing):
- Use `Secure` flag (HTTPS only)
- Use `HttpOnly` flag (no JS access)
- Use `SameSite=Strict` (CSRF protection)
- Set short expiration times

### Error Handling & Logging

#### Current Implementation

**Good**:
- Try-catch blocks around API calls
- Console.error for debugging
- User-friendly error messages

**Risks**:
- Error messages may leak implementation details
- Console logs in production

**Recommendations**:

1. **Remove Console Logs in Production**:
```javascript
// vite.config.js
export default defineConfig({
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
  },
});
```

2. **Generic Error Messages**:
```javascript
// ❌ Bad - Exposes internals
catch (error) {
  alert(`Database connection failed: ${error.message}`);
}

// ✅ Good - Generic message
catch (error) {
  console.error("Internal error:", error);
  alert("An unexpected error occurred. Please try again.");
}
```

3. **Error Tracking Service** (future):
```javascript
import * as Sentry from '@sentry/react';

Sentry.captureException(error);
```

### Code Security Practices

#### Review Checklist

Before merging code, verify:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on user data
- [ ] Error handling doesn't leak sensitive info
- [ ] Third-party libraries are from trusted sources
- [ ] No `eval()` or similar unsafe functions
- [ ] XSS protection (no `dangerouslySetInnerHTML`)
- [ ] Authentication checks on protected routes
- [ ] HTTPS used for all external requests
- [ ] Dependencies updated and audited

#### Code Review

- **Required**: At least one reviewer for security-sensitive changes
- **Focus Areas**: Auth, data handling, external integrations
- **Tools**: GitHub security scanning, CodeQL

## Reporting a Vulnerability

### Process

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. **Use GitHub Security Advisories**: Navigate to https://github.com/Krosebrook/seth/security/advisories and click "Report a vulnerability"
3. **Alternative**: Email the maintainers privately through GitHub or create a draft security advisory
4. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix Development**: Depends on severity
  - Critical: Within 24 hours
  - High: Within 1 week
  - Medium: Within 1 month
  - Low: Next release cycle

### Recognition

- Security researchers will be acknowledged (with permission)
- Serious vulnerabilities may be eligible for bounties (future program)

## Security Roadmap

### Short-term (v0.2.0)

- [ ] Resolve all npm vulnerabilities
- [ ] Add input validation and length limits
- [ ] Implement rate limiting (client-side)
- [ ] Add Content Security Policy
- [ ] Remove console logs in production builds

### Mid-term (v0.4.0)

- [ ] Add session timeout and auto-logout
- [ ] Implement proper logout functionality
- [ ] Add privacy policy and terms of service
- [ ] Integrate error tracking (Sentry)
- [ ] Add GDPR compliance features (data export, deletion)

### Long-term (v0.8.0)

- [ ] Security audit by third-party firm
- [ ] Penetration testing
- [ ] SOC 2 compliance (for enterprise)
- [ ] HIPAA compliance (if handling health data)
- [ ] Bug bounty program
- [ ] Security dashboard for admins

## Compliance

### GDPR (EU)

**Applicable if**: Users in European Union

**Requirements**:
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] Right to access data (data export)
- [ ] Right to deletion (account deletion)
- [ ] Data breach notification
- [ ] Data processing agreements

**Current Status**: Partially compliant (data stored in Base44)

### CCPA (California)

**Applicable if**: California residents

**Requirements**:
- [ ] Privacy notice
- [ ] Do Not Sell opt-out
- [ ] Data disclosure (what's collected)
- [ ] Data deletion

**Current Status**: Partially compliant

### Recommendations

1. Add clear privacy policy
2. Implement data export feature
3. Implement account/data deletion
4. Add cookie/privacy consent banner
5. Consult legal expert for full compliance

## Security Contacts

- **Security Lead**: SETH Development Team
- **Email**: Create a security@yourproject.com or use your GitHub Security Advisories at https://github.com/Krosebrook/seth/security/advisories
- **GitHub Security**: Report vulnerabilities via https://github.com/Krosebrook/seth/security
- **PGP Key**: [To be added when security email is established]
- **Response Time**: 48 hours for initial response

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Base44 Security Documentation](https://docs.base44.com/security)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

---

**Last Updated**: 2024-12-30  
**Version**: 1.0  
**Next Review**: 2025-03-30
