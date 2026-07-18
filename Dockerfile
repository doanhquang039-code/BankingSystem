# ============================================================
# Multi-stage Dockerfile for BankingSystem Spring Boot App
# Stage 1: Build with Maven
# Stage 2: Run with minimal JRE 21 image
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy dependency descriptors first (better layer caching)
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./

# Download dependencies (cached if pom.xml unchanged)
RUN mvn dependency:go-offline -q

# Copy source code
COPY backend ./backend

# Build the fat JAR (skip tests in Docker build — run tests in CI separately)
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S banking && adduser -S banking -G banking

# Copy the built JAR
COPY --from=builder /build/target/*.jar app.jar

# Change ownership
RUN chown banking:banking app.jar

USER banking

# Spring Boot port
EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
