# Testing Guide

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage
```bash
npm test -- --coverage
```

### Specific Test File
```bash
npm test -- auth.test.ts
```

## Test Coverage

Current coverage target: **70%+**

- **Unit Tests**: Service and utility functions
- **Integration Tests**: API endpoints and database operations
- **Test Framework**: Jest + ts-jest

## Writing Tests

### Unit Test Example
```typescript
// src/services/auth.test.ts
import { generateTokens } from '../auth';

describe('Auth Service', () => {
  it('should generate valid JWT tokens', () => {
    const { accessToken, refreshToken } = generateTokens('123', 'test@example.com', 'user');
    
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(accessToken).toMatch(/^eyJ/); // JWT format
  });
});
```

### Integration Test Example
```typescript
// src/routes/auth.integration.test.ts
import request from 'supertest';
import app from '../index';

describe('Auth Routes', () => {
  it('POST /register should create new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- **Push to main**: Full test suite
- **Pull requests**: Full test suite + coverage validation
- **Manual trigger**: Via GitHub Actions

## Test Database

Tests use:
- **MongoDB**: Embedded or real instance
- **Redis**: Real instance (configured in CI)

## Coverage Reports

Generated in `./coverage/` directory:
- `coverage/index.html`: HTML report
- `coverage/coverage-final.json`: JSON format

View HTML report:
```bash
open coverage/index.html
```

## Performance Testing

Load testing example:
```bash
npm install -g autocannon
autocannon -c 100 -d 30 http://localhost:3000/health
```

Results show:
- Requests/sec
- Latency (avg, p99)
- Throughput
