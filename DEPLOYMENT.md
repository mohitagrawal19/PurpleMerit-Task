# Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ for local development
- Git repository (GitHub/GitLab/Bitbucket)
- Cloud account (AWS, Azure, GCP, or similar)

## Local Deployment

### Using Docker Compose

1. **Start all services**:
```bash
docker-compose up -d
```

2. **Verify services**:
```bash
docker-compose ps
curl http://localhost:3000/health
```

3. **View logs**:
```bash
docker-compose logs -f app
```

4. **Stop services**:
```bash
docker-compose down
```

## Cloud Deployment

### AWS ECS (Recommended)

1. **Create ECR repository**:
```bash
aws ecr create-repository --repository-name workspace-backend --region us-east-1
```

2. **Build and push image**:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t workspace-backend:latest .
docker tag workspace-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/workspace-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/workspace-backend:latest
```

3. **Deploy with CloudFormation** (create `deploy.yml`):
```yaml
Resources:
  AppCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: workspace-backend-cluster

  AppService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref AppCluster
      TaskDefinition: workspace-task
      DesiredCount: 2
      LaunchType: FARGATE
```

4. **Scale horizontally**:
```bash
aws ecs update-service --cluster workspace-backend-cluster --service workspace-app --desired-count 5
```

### Heroku Deployment

1. **Create Heroku app**:
```bash
heroku create workspace-backend
heroku config:set NODE_ENV=production
```

2. **Deploy**:
```bash
git push heroku main
```

3. **View logs**:
```bash
heroku logs --tail
```

## CI/CD Pipeline Setup

### GitHub Actions

The `.github/workflows/ci.yml` includes:
- Linting with ESLint
- Testing with Jest
- Coverage reports
- Docker image building

### Deployment Workflow

1. **On push to main**: Run tests and build Docker image
2. **On pull request**: Run tests and linting
3. **Manual deployment**: Use GitHub Actions workflow_dispatch

## Environment Setup

### Production Environment Variables

```bash
# Security
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# Database
DATABASE_URL=postgresql://user:password@prod-db.rds.amazonaws.com:5432/workspace
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/workspace_db

# Cache
REDIS_URL=redis://prod-redis.elasticache.amazonaws.com:6379

# API
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info

# Platform
NODE_ENV=production
PORT=3000
```

## Monitoring & Logging

### CloudWatch (AWS)

1. **Enable ECS Container Insights**:
```bash
aws ecs update-cluster-settings \
  --cluster workspace-backend-cluster \
  --settings name=containerInsights,value=enabled
```

2. **View metrics in CloudWatch Console**
3. **Set up alarms** for high memory/CPU

### Log Aggregation

- **CloudWatch Logs**: Automatically collected from ECS
- **ELK Stack**: For on-premise deployments
- **Datadog**: Third-party APM solution

## Database Setup

### MongoDB Atlas (Cloud)

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses
4. Use connection string: `mongodb+srv://user:password@cluster.mongodb.net/workspace_db`

### PostgreSQL (AWS RDS)

1. Create RDS instance (Multi-AZ for production)
2. Configure security groups
3. Create database and user
4. Update DATABASE_URL

### Redis (AWS ElastiCache)

1. Create ElastiCache cluster (Redis mode)
2. Configure security groups
3. Use endpoint URL for REDIS_URL

## Health Checks & Readiness

### Configure ECS task health check

```bash
aws ecs register-task-definition \
  --healthCheck \
  command="CMD-SHELL,curl -f http://localhost:3000/health || exit 1" \
  --interval=30 \
  --timeout=5 \
  --retries=3
```

## Backup & Recovery

### Database Backups

**MongoDB**:
```bash
mongodump --uri="$MONGODB_URI" --out=./backups
mongorestore --uri="$MONGODB_URI" ./backups
```

**PostgreSQL**:
```bash
pg_dump $DATABASE_URL > backup.sql
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Enable AWS RDS automated backups (7-35 days)
- Enable MongoDB Atlas automatic backups

## Performance Optimization

### Cache Optimization
```typescript
// Implement cache warming on startup
await initializeCacheWarming();

// Cache frequently accessed data
await cacheSet('active:users', JSON.stringify(users), 3600);
```

### Database Optimization
- Enable slow query logs
- Add missing indexes
- Implement query pagination
- Use connection pooling

### API Response Compression
```typescript
import compression from 'compression';
app.use(compression());
```

## Disaster Recovery

### RTO (Recovery Time Objective): 15 minutes
### RPO (Recovery Point Objective): 5 minutes

### Failover Setup
1. **Database Replication**: Enable MongoDB replica set or RDS Multi-AZ
2. **Load Balancer**: Use Application Load Balancer with health checks
3. **Auto-scaling**: Configure ECS auto-scaling based on CPU/memory
4. **Backup Strategy**: Daily snapshots, replicated to different region

## Upgrade Strategy

### Blue-Green Deployment

1. **Create new ECS service** (v2) with new image
2. **Route 10% traffic** to v2
3. **Monitor metrics** for 30 minutes
4. **Gradually increase** to 50%, then 100%
5. **Rollback if needed**: Switch back to v1

```bash
aws elbv2 modify-rule \
  --rule-arn arn:aws:elasticloadbalancing:... \
  --conditions Field=path-pattern,Values="/api/*" \
  --actions Type=forward,TargetGroupArn=arn-of-v2
```

## Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] Database migrations completed
- [ ] API documentation updated
- [ ] Monitoring and alarms configured
- [ ] Backup systems verified
- [ ] Performance baselines established
- [ ] Security audit completed
- [ ] User acceptance testing passed
- [ ] Rollback plan documented
- [ ] Team trained on deployment

## Support

For deployment issues, contact: career@purplemerit.com
