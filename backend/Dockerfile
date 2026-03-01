# ---------- STAGE 1: Build Frontend ----------
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


# ---------- STAGE 2: Build Backend ----------
FROM gradle:9-jdk25 AS backend-build
WORKDIR /app

COPY backend/build.gradle backend/settings.gradle ./
COPY backend/gradle ./gradle
COPY backend/gradlew ./
COPY backend/src ./src
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon


# ---------- STAGE 3: Runtime ----------
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/build/libs/*.jar app.jar
COPY --from=frontend-build /frontend/dist /app/static

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
