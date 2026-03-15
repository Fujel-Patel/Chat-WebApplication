# Testing Guide - Backend

This document provides guidelines for writing and running tests for the Chat-WebApplication backend.

## Setup

Tests use **Jest** as the testing framework. Tests run with Node.js ESM support.

### Install Dependencies
```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm test:watch

# Run tests with coverage report
npm test -- --coverage
```

## Test Structure

Tests are located in `src/__tests__/` directory with `.test.js` extension.

```
Backend/
├── src/
│   ├── __tests__/
│   │   ├── utils.test.js
│   │   ├── middleware.test.js
│   │   └── ...
│   ├── controllers/
│   ├── models/
│   └── ...
```

## Writing Tests

### Basic Test Structure
```javascript
describe("Feature Name", () => {
  test("should do something", () => {
    // Arrange: Set up test data
    const input = "test";
    
    // Act: Execute function
    const result = myFunction(input);
    
    // Assert: Check result
    expect(result).toBe("expected output");
  });
});
```

### Common Assertions
```javascript
// Equality
expect(result).toBe(5);
expect(result).toEqual({ name: "John" });

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeLessThan(10);

// Strings
expect(result).toContain("substring");
expect(result).toMatch(/regex/);

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain(item);
expect(arr).toEqual([1, 2, 3]);

// Exceptions
expect(() => myFunction()).toThrow();
expect(() => myFunction()).toThrow(Error);
```

## Sample Tests

### Testing Utility Functions
```javascript
describe("Password Validation", () => {
  test("should validate strong passwords", () => {
    const isValid = validatePassword("SecurePass123!");
    expect(isValid).toBeTruthy();
  });

  test("should reject weak passwords", () => {
    const isValid = validatePassword("weak");
    expect(isValid).toBeFalsy();
  });
});
```

### Mocking Dependencies
```javascript
jest.mock("../lib/db.js");

describe("User Controller", () => {
  test("should create user", async () => {
    const mockUser = { _id: 1, name: "John" };
    User.create.mockResolvedValue(mockUser);
    
    const result = await createUser({ name: "John" });
    expect(result).toEqual(mockUser);
  });
});
```

### Testing Express Middleware
```javascript
describe("Auth Middleware", () => {
  test("should allow authenticated requests", () => {
    const req = { cookies: { jwt: "valid-token" } };
    const res = {};
    const next = jest.fn();
    
    protectRoute(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test("should reject requests without token", () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    protectRoute(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the function does, not how it does it
   - Focus on inputs and outputs

2. **Use Descriptive Test Names**
   - `should validate email correctly` ✓
   - `test1` ✗

3. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/teardown

4. **Mock External Dependencies**
   - Mock database, APIs, file system
   - Focus on testing your code, not third-party libraries

5. **Test Edge Cases**
   - Null/undefined values
   - Empty arrays/objects
   - Boundary conditions
   - Error scenarios

6. **Keep Tests Fast**
   - Mock slow operations (database, network)
   - Avoid real file I/O
   - Use in-memory alternatives where possible

## Example: Full Test Suite for a Feature

```javascript
import { getUserById, createUser } from "../controllers/user.controller.js";
import User from "../models/user.model.js";

jest.mock("../models/user.model.js");

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    test("should return user when found", async () => {
      const mockUser = { _id: "1", name: "John", email: "john@example.com" };
      User.findById.mockResolvedValue(mockUser);

      const result = await getUserById("1");

      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith("1");
    });

    test("should return null when user not found", async () => {
      User.findById.mockResolvedValue(null);

      const result = await getUserById("999");

      expect(result).toBeNull();
    });

    test("should handle database errors", async () => {
      const error = new Error("Database error");
      User.findById.mockRejectedValue(error);

      await expect(getUserById("1")).rejects.toThrow("Database error");
    });
  });

  describe("createUser", () => {
    test("should create user with valid data", async () => {
      const userData = { name: "Jane", email: "jane@example.com" };
      const mockUser = { _id: "2", ...userData };
      User.create.mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(result).toEqual(mockUser);
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    test("should throw error for duplicate email", async () => {
      const error = new Error("Email already exists");
      User.create.mockRejectedValue(error);

      await expect(createUser({ name: "Jane", email: "existing@example.com" }))
        .rejects.toThrow("Email already exists");
    });
  });
});
```

## Continuous Integration

Tests are recommended to run in CI/CD pipelines (GitHub Actions, GitLab CI, etc.) before:
- Pushing to main branch
- Creating pull requests
- Deploying to production

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)

## Questions?

Refer to the main [README.md](../../README.md) or contact the development team.
