# Test Authorization Implementation

## 1. Create test users

### Create Manager User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Manager",
    "email": "manager@test.com",
    "password": "password123",
    "role": "manager"
  }'
```

### Create Admin User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane",
    "surname": "Admin",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Create Regular User (Reporter)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "surname": "Reporter",
    "email": "reporter@test.com",
    "password": "password123",
    "role": "reporter"
  }'
```

## 2. Test Project Creation

### Success: Manager creates project

```bash
curl -X POST http://localhost:3000/api/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Test project description",
    "createdBy": "[MANAGER_USER_ID]"
  }'
```

### Failure: Reporter tries to create project

```bash
curl -X POST http://localhost:3000/api/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Project",
    "description": "This should fail",
    "createdBy": "[REPORTER_USER_ID]"
  }'
```

Expected: 403 Forbidden error
