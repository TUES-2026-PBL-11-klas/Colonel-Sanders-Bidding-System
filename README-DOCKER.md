# Docker Setup Guide - Colonel Sanders Bidding System

This guide explains how to run the Colonel Sanders Bidding System using Docker.

## Local Development

**Fast development workflow**: PostgreSQL in Docker + Spring Boot running locally

### Prerequisites
- Docker Desktop installed and running
- Java 21 JDK installed
- Gradle 9.3.0+

### Step 1: Start PostgreSQL Container

```bash
# From project root
docker-compose up -d postgres
```

Wait for the database to be healthy (10-15 seconds):

```bash
docker ps --filter "name=postgres"
```

Should show `(healthy)` in the STATUS column.

### Step 2: Run Spring Boot Locally

```powershell
Get-Content .env | ForEach-Object {
	if ($_ -match '^([^#][^=]+)=(.*)$') {
		[Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
	}
}
cd backend
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

### Step 3: Verify Database Schema

Connect to the database to see auto-created tables:

```bash
docker exec -it colonel-sanders-bidding-system-postgres psql -U admin -d mydb -c "\dt"
```

### Stop PostgreSQL (keep data)

```bash
docker-compose stop postgres
```

### Stop PostgreSQL and Delete Data

```bash
docker-compose down -v
```

---

## Full Docker Stack Deployment

Run both PostgreSQL and Spring Boot as Docker containers (for staging/CI environments)

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+

### Setup Environment Variables

Create a `.env` file in the project root with your database credentials:

```bash
# .env (in project root)
DB_URL=jdbc:postgresql://postgres:5432/mydb
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Docker Compose automatically reads this file and passes variables to all services.

**Note:** Add `.env` to `.gitignore` to prevent credentials from being committed:

```bash
echo ".env" >> .gitignore
```

### Start the Full Stack

```bash
# From the project root directory
docker-compose up --build
```

This command will:
1. Read environment variables from `.env`
2. Build the Spring Boot backend application
3. Start PostgreSQL 16-Alpine database
4. Start the backend service on port 8080

The backend will be available at: `http://localhost:8080`

### Stop the Stack

```bash
docker-compose down
```

To also remove the database volume (clean slate):

```bash
docker-compose down -v
```

---

## Architecture

### Services

#### PostgreSQL (postgres)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: mydb
- **User**: admin
- **Password**: admin
- **Volume**: `postgres_data` (persistent storage)
- **Healthcheck**: Enabled - waits until database is ready

#### Spring Boot Backend
- **Port**: 8080
- **Depends on**: PostgreSQL (waits for health check)
- **Auto-restart**: Unless manually stopped

---

## Configuration

### Environment Variables

The backend service uses these environment variables:

```yaml
DB_URL: jdbc:postgresql://postgres:5432/mydb
DB_USERNAME: admin
DB_PASSWORD: admin
```

These are injected into `application.yml` using Spring's property placeholder syntax:
- `${DB_URL}`
- `${DB_USERNAME}`
- `${DB_PASSWORD}`

For local development, PostgreSQL runs on `localhost:5432`. In Docker, it runs on the `postgres` service hostname.

The `ddl-auto: update` setting in `application.yml` ensures tables are created if they don't exist.

---

## Docker Images

### Base Images Used

**Build Stage** (temporary, only for compilation):
- `gradle:8-jdk21` - 1.5GB (Gradle build environment)

**Runtime Stage** (final image):
- `eclipse-temurin:21-jre-alpine` - 100MB (minimal JRE only)

### Image Optimization

Multi-stage Dockerfile reduces final image size from 1.5GB to ~100MB by:
1. Compiling code in a throwaway build container
2. Copying only the compiled JAR to a minimal JRE image
3. Discarding build artifacts and dependencies

---

## Troubleshooting

### Backend won't start - "Connection refused"

```
ERROR: Could not obtain isolated JDBC connection
FATAL: password authentication failed
```

**Solution**: Ensure PostgreSQL container is healthy:

```bash
docker ps --filter "name=postgres"
```

Should show `(healthy)` in the STATUS column. Wait 10-15 seconds after `docker-compose up` for database initialization.

### Rebuild without cache

```bash
docker-compose up --build --no-cache
```

### Endpoints return 404 even though controllers exist

If an API route (for example `/api/products`) returns `404`, the backend container may be running a stale image.

Rebuild and restart the backend from the root compose file:

```bash
docker compose -f "C:\Users\User\Desktop\Colonel-Sanders-Bidding-System\docker-compose.yml" up -d --build backend
```

If you are already in the project root, you can also run:

```bash
docker compose up -d --build backend
```

### View logs

```bash
# All services
docker-compose logs -f

# PostgreSQL only
docker-compose logs -f postgres

# Backend only
docker-compose logs -f backend
```

### Connect to database directly

```bash
docker exec -it colonel-sanders-bidding-system-postgres psql -U admin -d mydb
```

In psql, list tables:
```sql
\dt  -- shows all tables
```

### Remove everything and start fresh

```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

---

## Production Notes

For production deployment:
- Change `admin/root` credentials to strong passwords
- Use environment variables or secrets management (not hardcoded)
- Set `ddl-auto: validate` instead of `update`
- Configure SCRAM-SHA-256 authentication instead of trust
- Use persistent volumes with backup strategy
- Add resource limits (memory, CPU)
- Set up health checks and monitoring

---

## Files Modified

- **docker-compose.yml** - Service definitions
- **Dockerfile** - Multi-stage build configuration
- **application.yml** - Spring Boot configuration with placeholders
- **build.gradle** - DevTools dependency for hot reload

