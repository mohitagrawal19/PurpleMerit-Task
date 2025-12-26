# API Reference

## Base URL
```
http://localhost:3000/api/v1
https://api.yourdomain.com/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token in Authorization header:

```http
Authorization: Bearer <accessToken>
```

## Response Format

### Success Response
```json
{
  "id": "resource-id",
  "data": { /* resource data */ },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

## Authentication Endpoints

### 1. Register User
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors**:
- `400`: Invalid email format
- `400`: Password too short (min 8 chars)
- `400`: Email already registered

---

### 2. Login User
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors**:
- `401`: Invalid credentials

---

### 3. Refresh Token
**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- `400`: Refresh token required
- `401`: Invalid refresh token

---

### 4. Get Current User
**Endpoint**: `GET /auth/me`

**Headers**:
```http
Authorization: Bearer <accessToken>
```

**Response** (200):
```json
{
  "_id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:00:00Z"
}
```

**Errors**:
- `401`: Unauthorized

---

## Projects Endpoints

### 1. List Projects
**Endpoint**: `GET /projects`

**Query Parameters**:
- `limit` (optional): Number of results (default: 20)
- `skip` (optional): Number to skip (default: 0)

**Response** (200):
```json
[
  {
    "_id": "project-123",
    "name": "My Project",
    "description": "Project description",
    "ownerId": "user-123",
    "collaborators": [
      { "userId": "user-456", "role": "collaborator" },
      { "userId": "user-789", "role": "viewer" }
    ],
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:00:00Z"
  }
]
```

---

### 2. Get Project
**Endpoint**: `GET /projects/{projectId}`

**Response** (200):
```json
{
  "_id": "project-123",
  "name": "My Project",
  "description": "Project description",
  "ownerId": "user-123",
  "collaborators": [
    { "userId": "user-456", "role": "collaborator" }
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:00:00Z"
}
```

**Errors**:
- `404`: Project not found

---

### 3. Create Project
**Endpoint**: `POST /projects`

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

**Response** (201):
```json
{
  "_id": "project-123",
  "name": "New Project",
  "description": "Project description",
  "ownerId": "user-123",
  "collaborators": [
    { "userId": "user-123", "role": "owner" }
  ],
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**Errors**:
- `400`: Name too short

---

### 4. Update Project
**Endpoint**: `PUT /projects/{projectId}`

**Request Body**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "_id": "project-123",
  "name": "Updated Project Name",
  "description": "Updated description",
  "ownerId": "user-123",
  "collaborators": [...],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**Errors**:
- `403`: Not authorized (not owner)
- `404`: Project not found

---

### 5. Delete Project
**Endpoint**: `DELETE /projects/{projectId}`

**Response** (204): No content

**Errors**:
- `403`: Not authorized
- `404`: Project not found

---

### 6. Invite Collaborator
**Endpoint**: `POST /projects/{projectId}/invite`

**Request Body**:
```json
{
  "userId": "user-456",
  "role": "collaborator"
}
```

**Response** (200):
```json
{
  "_id": "project-123",
  "name": "My Project",
  "description": "...",
  "ownerId": "user-123",
  "collaborators": [
    { "userId": "user-123", "role": "owner" },
    { "userId": "user-456", "role": "collaborator" }
  ],
  "createdAt": "...",
  "updatedAt": "2025-12-27T10:35:00Z"
}
```

**Errors**:
- `403`: Not authorized
- `400`: userId and role required

**Roles**:
- `owner`: Full permissions
- `collaborator`: Read/Write permissions
- `viewer`: Read-only permissions

---

## Workspaces Endpoints

### 1. List Workspaces
**Endpoint**: `GET /workspaces`

**Response** (200):
```json
[
  {
    "_id": "workspace-123",
    "projectId": "project-123",
    "name": "Main Workspace",
    "members": [
      { "userId": "user-123", "status": "active" },
      { "userId": "user-456", "status": "idle" }
    ],
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:00:00Z"
  }
]
```

---

### 2. Get Workspace
**Endpoint**: `GET /workspaces/{projectId}`

**Response** (200): Workspace object

**Errors**:
- `404`: Workspace not found

---

### 3. Create Workspace
**Endpoint**: `POST /workspaces`

**Request Body**:
```json
{
  "projectId": "project-123",
  "name": "Development Workspace"
}
```

**Response** (201): Workspace object

**Errors**:
- `400`: projectId and name required

---

### 4. Join Workspace
**Endpoint**: `POST /workspaces/{workspaceId}/join`

**Response** (200): Updated workspace object

**Errors**:
- `404`: Workspace not found

---

## Jobs Endpoints

### 1. List Jobs
**Endpoint**: `GET /jobs`

**Query Parameters**:
- `status` (optional): 'pending', 'processing', 'completed', 'failed'
- `limit` (optional): Default 20
- `skip` (optional): Default 0

**Response** (200):
```json
[
  {
    "_id": "job-123",
    "userId": "user-123",
    "type": "code-execution",
    "input": {
      "code": "print('hello')"
    },
    "status": "completed",
    "result": {
      "output": "hello",
      "executionTime": "2s"
    },
    "retries": 0,
    "maxRetries": 3,
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:02:00Z"
  }
]
```

---

### 2. Get Job
**Endpoint**: `GET /jobs/{jobId}`

**Response** (200): Job object

**Errors**:
- `403`: Not authorized
- `404`: Job not found

---

### 3. Submit Job
**Endpoint**: `POST /jobs`

**Request Body**:
```json
{
  "type": "code-execution",
  "input": {
    "code": "print('hello world')"
  }
}
```

**Response** (201):
```json
{
  "_id": "job-123",
  "userId": "user-123",
  "type": "code-execution",
  "input": { "code": "print('hello world')" },
  "status": "pending",
  "retries": 0,
  "maxRetries": 3,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**Job Types**:
- `code-execution`: Execute code snippets
- `data-processing`: Process data batches

**Errors**:
- `400`: type and input required

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected');
});
```

### Join Workspace
**Emit**:
```javascript
socket.emit('join-workspace', 'workspace-123');
```

**Listen**:
```javascript
socket.on('user:joined', (data) => {
  console.log('User joined:', data.userId);
  // { userId: "user-456", timestamp: "2025-12-27T..." }
});

socket.on('user:left', (data) => {
  console.log('User left:', data.userId);
});
```

### Cursor Position
**Emit**:
```javascript
socket.emit('cursor:update', {
  workspaceId: 'workspace-123',
  position: { x: 100, y: 200 },
  cursor: 'pointer'
});
```

**Listen**:
```javascript
socket.on('cursor:update', (data) => {
  console.log(`${data.userId}'s cursor at`, data.position);
});
```

### File Changes
**Emit**:
```javascript
socket.emit('file:change', {
  workspaceId: 'workspace-123',
  fileId: 'file-456',
  content: 'new file content',
  timestamp: Date.now()
});
```

**Listen**:
```javascript
socket.on('file:change', (data) => {
  console.log(`${data.userId} modified file`, data.fileId);
});
```

### Activity Update
**Emit**:
```javascript
socket.emit('activity:update', {
  workspaceId: 'workspace-123',
  action: 'editing',
  fileId: 'file-456'
});
```

**Listen**:
```javascript
socket.on('activity:update', (data) => {
  console.log(`${data.userId} is ${data.action}`);
});
```

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per 15 minutes

Headers returned:
```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640589000
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_INPUT | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Pagination

Endpoints supporting pagination accept:
- `limit`: Items per page (1-100, default: 20)
- `skip`: Items to skip (default: 0)

Example:
```http
GET /api/v1/projects?limit=10&skip=20
```

---

## Sorting

Use `sort` query parameter:
```http
GET /api/v1/jobs?sort=-createdAt
```

Prefix with `-` for descending order.

---

**API Version**: 1.0.0  
**Last Updated**: December 2025
