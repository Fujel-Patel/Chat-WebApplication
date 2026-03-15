# Security Guide - Backend

This document outlines security best practices and implementations for the Chat-WebApplication backend.

## Security Considerations

### 1. Environment Variables

**Never commit secrets to version control.**

- `.env` file is in `.gitignore`
- `.env.example` shows structure without secrets
- Keep `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*` secret
- Rotate secrets regularly

**Implementation:**
```javascript
// Backend/.env (do NOT commit)
MONGODB_URI=your-secret-connection-string
JWT_SECRET=your-secret-key

// Backend/.env.example (safe to commit)
MONGODB_URI=your-mongodb-uri-here
JWT_SECRET=your-secret-key-here
```

### 2. Authentication & JWT

**Current Implementation:**
- JWT tokens stored in HTTP-only cookies
- Tokens expire and require re-authentication
- Protected routes use `protectRoute` middleware

**Best Practices:**
- Never store sensitive data in JWT payload
- Use short expiration times (15-30 minutes)
- Implement refresh token mechanism
- Validate JWT on every protected request

**Implementation in `src/middleware/protectRoute.js`:**
```javascript
// Verify JWT from cookies
export const protectRoute = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
```

### 3. Password Security

**Requirements:**
- Passwords hashed with bcryptjs before storage
- Minimum 8 characters with mixed case, numbers, symbols
- Never return password in API responses
- Use salt rounds of 10+

**Implementation:**
```javascript
import bcryptjs from "bcryptjs";

// Hashing password
const salt = await bcryptjs.genSalt(10);
const hashedPassword = await bcryptjs.hash(password, salt);

// Comparing passwords
const isMatch = await bcryptjs.compare(password, user.password);
```

### 4. CORS Configuration

**Current Implementation:**
- Whitelist allowed origins in `CORS_ORIGINS` environment variable
- Block requests from unauthorized origins
- Credentials allowed only for trusted origins

**Configuration:**
```javascript
// Backend/src/index.js and src/lib/socket.js
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`), false);
      }
    },
    credentials: true,
  })
);
```

### 5. Input Validation & Sanitization

**Requirements:**
- Validate all user inputs
- Sanitize data to prevent injection attacks
- Use strong schema validation (Mongoose schemas)

**Implementation Example:**
```javascript
// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Mongoose schema with validation
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validateEmail, "Invalid email format"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});
```

### 6. SQL/NoSQL Injection Prevention

**Current Implementation:**
- Using Mongoose ORM prevents direct query injection
- Parameterized queries protect against injection

**Best Practice:**
```javascript
// Good - Mongoose handles sanitization
const user = await User.findById(userId);

// Avoid - Direct MongoDB queries without sanitization
// db.collection('users').findOne({ _id: userId })
```

### 7. Rate Limiting

**Recommended:** Implement rate limiting to prevent brute force attacks and DoS.

**Option 1: express-rate-limit**
```bash
npm install express-rate-limit
```

**Implementation:**
```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/auth/login", limiter);
app.use("/api/auth/signup", limiter);
app.use("/api/messages/send", limiter);
```

### 8. HTTPS/TLS

**Production Requirement:**
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use strong TLS 1.2 or higher

**Implementation:**
```javascript
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 9. Security Headers

**Recommended:** Use Helmet to set security headers.

```bash
npm install helmet
```

**Implementation:**
```javascript
import helmet from "helmet";

app.use(helmet());
```

**This sets:**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)

### 10. Data Leakage Prevention

**Best Practices:**
- Never return sensitive data in error messages
- Don't expose stack traces in production
- Exclude passwords from API responses

**Implementation:**
```javascript
// Bad - Exposes internal error
res.status(500).json({ error: error.stack });

// Good - Generic error message
res.status(500).json({ message: "Internal server error" });

// Exclude password from user data
const user = await User.findById(id).select("-password");
```

### 11. Logging & Monitoring

**Recommendations:**
- Log security-relevant events (login attempts, unauthorized access)
- Don't log sensitive data (passwords, tokens)
- Monitor for suspicious activities

**Implementation:**
```javascript
// Good - Log login attempt
console.log(`Login attempt: ${email} at ${new Date().toISOString()}`);

// Bad - Logs sensitive data
console.log(`User logged in: ${user}`);
```

### 12. API Security Checklist

- [ ] All environment variables are in `.env` (not committed)
- [ ] JWT tokens have expiration times
- [ ] Passwords are hashed with bcryptjs
- [ ] CORS is configured with whitelist
- [ ] Input validation is implemented
- [ ] Rate limiting is enabled on auth endpoints
- [ ] HTTPS is enforced in production
- [ ] Security headers are set (Helmet)
- [ ] Sensitive data is not logged
- [ ] MongoDB injection is prevented via Mongoose
- [ ] Error messages don't expose internals
- [ ] User passwords are never returned in APIs

## Deployment Security

### Before Deploying to Production

1. **Review Environment Variables:**
   - Verify all secrets are set in deployment platform
   - Remove hardcoded secrets from code

2. **Enable HTTPS:**
   - Ensure SSL certificate is valid
   - Redirect HTTP to HTTPS

3. **Set Security Headers:**
   - Use Helmet middleware
   - Configure Content-Security-Policy

4. **Rate Limiting:**
   - Enable on auth endpoints
   - Set appropriate limits

5. **Database Security:**
   - Use MongoDB Atlas IP whitelist
   - Enable authentication
   - Use strong connection strings

6. **Monitoring:**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API performance
   - Alert on suspicious activities

## Common Vulnerabilities

### Cross-Site Scripting (XSS)
- **Risk:** Injecting malicious scripts in user data
- **Prevention:** Sanitize user input, use parameterized rendering

### Cross-Site Request Forgery (CSRF)
- **Risk:** Unauthorized actions on behalf of users
- **Prevention:** CSRF tokens, SameSite cookies

### Man-in-the-Middle (MITM)
- **Risk:** Intercepting unencrypted communication
- **Prevention:** Use HTTPS/TLS, secure cookies

### Brute Force
- **Risk:** Repeated login attempts to guess passwords
- **Prevention:** Rate limiting, account lockout

## Incident Response

If a security incident occurs:

1. **Identify** - Determine what was compromised
2. **Isolate** - Stop further damage
3. **Eradicate** - Remove the vulnerability
4. **Recover** - Restore systems to normal
5. **Learn** - Update processes to prevent recurrence

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

## Questions?

For security concerns or vulnerabilities, contact the development team or security@example.com.

---

**Last Updated:** March 14, 2026
