# Stage 1: Build binary using latest Go Alpine image
FROM golang:alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

# Install git and ca-certificates for Go dependencies
RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build statically linked binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/main.go

# Stage 2: Final minimal runtime image
FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Copy compiled binary from builder
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example ./.env

# Create upload directory
RUN mkdir -p ./uploads

EXPOSE 8080

CMD ["./server"]
