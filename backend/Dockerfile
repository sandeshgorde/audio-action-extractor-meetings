FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Install Python for transcription script
RUN apk add --no-cache python3 py3-pip

# Install Groq SDK
RUN pip3 install --no-cache-dir --break-system-packages groq

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy transcription script
COPY scripts/transcribe.py /app/scripts/

ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV GROQ_API_KEY=""
ENV PORT=10000

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$PORT -Dpython.command=python3 -jar app.jar"]
