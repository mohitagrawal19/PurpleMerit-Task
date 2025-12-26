# Collaborative Workspace Backend

A production-grade real-time collaborative workspace backend service supporting multiple developers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│          (Web/Desktop Clients via REST + WebSocket)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                   API Gateway Layer                          │
│    (Rate Limiting, CORS, Authentication Middleware)         │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────────────┐   │   ┌────────────▼───────┐
│  REST APIs     │   │   │  WebSocket Server  │
│ • Auth         │   │   │ • Real-time Events │
│ • Projects     │   │   │ • Cursor Tracking  │
│ • Workspaces   │   │   │ • File Changes     │
│ • Jobs         │   │   └────────────┬───────┘
└───┬────────────┘   │                │
    │                │       ┌────────┴──────────┐
    │                │       │                   │
┌───▼─────────────────▼───┐  │  ┌────────────────▼────┐
│   Service Layer         │  │  │  Message Queue      │
│ • Auth Service          │  │  │  (Redis/Bull)       │
│ • Project Service       │  │  │ • Job Processing    │
│ • Workspace Service     │  │  │ • Event Broadcasting│
│ • Job Service           │  │  └────────────────┬────┘
└───┬─────────────────────┘  │                   │
    │                        │      ┌────────────┴──────┐
    │                        │      │                   │
┌───▼────────────┬───────────▼──┐   │  ┌────────────────▼────┐
│  Data Layer    │               │   │  │  Worker Process    │
│ • MongoDB      │               │   │  │  • Job Execution   │
│ • PostgreSQL   │               │   │  │  • Result Storage  │
│ • Redis Cache  │               │   │  └────────────────────┘
└────────────────┴───────────────┘   │
                                      │
                         ┌────────────┴──────┐
                         │                   │
                    ┌────▼──────┐  ┌────────▼────┐
                    │  Pub/Sub   │  │   Caching   │
                    │  (Redis)   │  │  (Redis)    │
                    └────────────┘  └─────────────┘
```

## Core Features

### 1. Authentication & Authorization
- **JWT-based authentication** with configurable expiry
- **Token refresh mechanism** for secure long-lived sessions
- **Role-Based Access Control (RBAC)**: Owner, Collaborator, Viewer
- **Rate limiting** on all API endpoints
- **Secure password hashing** with bcryptjs

### 2. Project Management
- Create, read, update, delete projects
- Invite collaborators with role assignments
- Real-time member activity tracking
- Hierarchical workspace structure

### 3. Real-Time Collaboration
- **WebSocket-based communication** for instant updates
- **Event broadcasting**: user join/leave, file changes, cursor position
- **Redis Pub/Sub** for scalable event distribution
- **Activity tracking** across distributed sessions

### 4. Asynchronous Job Processing
- **Bull queue** for reliable job processing
- **Automatic retry logic** with exponential backoff
- **Idempotent processing** to prevent duplicates
- Support for multiple job types: code execution, data processing
- Job status tracking: pending → processing → completed/failed

### 5. Data Storage
- **MongoDB**: Document storage for projects, workspaces, jobs
- **PostgreSQL**: Relational data for user management (optional)
- **Redis**: Caching layer, Pub/Sub messaging, session store

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Real-time**: Socket.io
- **Databases**: MongoDB, PostgreSQL
- **Cache/Queue**: Redis, Bull
- **Auth**: JWT
- **Testing**: Jest
- **Containerization**: Docker, Docker Compose
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd collaborative-workspace-backend
npm install
cp .env.example .env
```

### Development

```bash
# Start all services with Docker Compose
npm run docker:up

# In another terminal, start the dev server
npm run dev

# Access Swagger docs at http://localhost:3000/api-docs
```

### Production Build

```bash
npm run build
npm run docker:build
npm start
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Project Management

#### List Projects
```http
GET /api/v1/projects
Authorization: Bearer <accessToken>
```

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

#### Invite Collaborator
```http
POST /api/v1/projects/{projectId}/invite
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": "user-id",
  "role": "collaborator"
}
```

### Real-Time Communication

#### WebSocket Events
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' }
});

// Join workspace
socket.emit('join-workspace', workspaceId);

// Listen for user join/leave
socket.on('user:joined', (data) => console.log(data));
socket.on('user:left', (data) => console.log(data));

// Send cursor position
socket.emit('cursor:update', {
  workspaceId,
  position: { x: 100, y: 200 },
  cursor: 'pointer'
});

// Broadcast file changes
socket.emit('file:change', {
  workspaceId,
  fileId: 'file-123',
  content: 'new content',
  timestamp: Date.now()
});
```

### Job Management

#### Submit Job
```http
POST /api/v1/jobs
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "type": "code-execution",
  "input": {
    "code": "print('hello world')"
  }
}
```

#### Get Job Status
```http
GET /api/v1/jobs/{jobId}
Authorization: Bearer <accessToken>
```

## Testing

### Run Tests
```bash
npm test
```

### Coverage Report
```bash
npm test -- --coverage
```

### Test Structure
- **Unit Tests**: Service logic, utilities
- **Integration Tests**: API endpoints, database operations
- **Target Coverage**: 70%+

## Deployment

### Docker Compose (Development)
```bash
docker-compose up
```

### Docker Build
```bash
docker build -t collaborative-workspace:latest .
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost \
  -e REDIS_URL=redis://localhost \
  collaborative-workspace:latest
```

### Environment Variables
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DATABASE_URL=postgresql://user:password@localhost/workspace_db
MONGODB_URI=mongodb://localhost:27017/workspace_db
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

## Design Decisions

### 1. **Polyglot Persistence**
- **MongoDB** for flexible document storage (projects, workspaces)
- **PostgreSQL** for structured user data (future scalability)
- **Redis** for high-performance caching and real-time messaging

### 2. **Event-Driven Architecture**
- Redis Pub/Sub for decoupled event broadcasting
- WebSocket for low-latency real-time updates
- Bull queue for reliable asynchronous processing

### 3. **Horizontal Scalability**
- Stateless API servers behind load balancer
- Shared Redis for session management
- Message queue enables multiple worker processes
- Database replication for data resilience

### 4. **Security-First Approach**
- JWT tokens with short expiry + refresh mechanism
- bcryptjs for password hashing
- Input validation using Joi
- CORS and Helmet for HTTP security
- Rate limiting to prevent abuse

### 5. **Production Readiness**
- Structured logging with Pino
- Comprehensive error handling
- Health check endpoint
- Environment-based configuration
- Docker for consistent deployment

## Scalability Considerations

### Vertical Scaling
- Optimize Node.js heap size
- Use clustering module for multi-core usage
- Connection pooling for databases

### Horizontal Scaling
- Deploy multiple API instances behind nginx/load balancer
- Shared Redis for cache invalidation
- Bull queue workers on separate machines
- MongoDB replication set for data consistency

### Database Optimization
- Indexing strategy on frequently queried fields
- Connection pooling (MongoDB: 100-200 connections)
- Query optimization with projection
- Data archival strategy for old jobs

### Caching Strategy
- Cache project/workspace metadata (TTL: 1 hour)
- Cache user roles for RBAC checks (TTL: 30 mins)
- Invalidate cache on mutations
- Redis memory management with LRU eviction

## Performance Metrics

- **API Response Time**: < 200ms (95th percentile)
- **WebSocket Latency**: < 50ms for event delivery
- **Job Processing**: Configurable based on workload
- **Database Queries**: Indexed for sub-100ms response
- **Memory Usage**: < 300MB per instance

## Observability

### Logging
- Structured JSON logs with Pino
- Log levels: debug, info, warn, error
- Request/response logging with Pino-http

### Metrics (Future)
- Prometheus integration for metrics export
- Grafana dashboards for visualization
- Alert rules for SLA monitoring

### Health Checks
- `GET /health` for service status
- Database connection validation
- Redis connectivity checks

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 10 requests per 15 minutes
- **File Upload**: 5 requests per 15 minutes
- **Custom**: Configurable per endpoint

## Future Enhancements

- [ ] Kubernetes deployment manifests
- [ ] GraphQL support
- [ ] WebRTC for peer-to-peer communication
- [ ] Redis Cluster for high availability
- [ ] Elasticsearch for advanced logging
- [ ] Feature flags using LaunchDarkly
- [ ] API versioning (v2, v3)
- [ ] Webhook support for external integrations
- [ ] File attachment support
- [ ] Comment/annotation system

## Support & Troubleshooting

### Common Issues

**Docker containers won't start**
```bash
docker-compose down -v
docker-compose up --build
```

**Port already in use**
```bash
# Change PORT in .env or docker-compose.yml
```

**Database connection errors**
- Verify DATABASE_URL and MONGODB_URI
- Check if services are running: `docker-compose ps`
- Review logs: `docker-compose logs app`

## Contributing

1. Create feature branch
2. Follow TypeScript/ESLint conventions
3. Add tests for new features
4. Run lint and tests before commit
5. Submit pull request

## License

MIT

## Contact

For support: career@purplemerit.com

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production Ready
