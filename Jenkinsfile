pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo "=== Stage 1: Checkout Code from Git ==="
                checkout scm
            }
        }

        stage('Run Backend Unit Tests') {
            steps {
                echo "=== Stage 2: Running Go Backend Unit Tests in Isolated Docker Container ==="
                sh '''
                    docker run --rm -v "${WORKSPACE}/app/backend":/app -w /app golang:alpine go test -v ./...
                '''
            }
        }

        stage('Run Frontend Build & Type Check') {
            steps {
                echo "=== Stage 3: Running Frontend Type Check & Build in Isolated Docker Container ==="
                sh '''
                    docker run --rm -v "${WORKSPACE}/app/frontend":/app -w /app node:22-slim sh -c "npm install && npx tsc --noEmit && npm run build"
                '''
            }
        }

        stage('Verify Docker Compose Build') {
            steps {
                echo "=== Stage 4: Verifying Docker Compose Build ==="
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "${WORKSPACE}":/app -w /app docker:cli docker compose -f docker-compose.blue-green.yml build
                '''
            }
        }

        stage('Blue-Green Deploy') {
            steps {
                echo "=== Stage 5: Zero-Downtime Blue-Green Deployment ==="
                sh '''
                    docker run --rm \
                        --network host \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v "${WORKSPACE}":/app \
                        -w /app \
                        docker:cli sh -c "apk add --no-cache curl > /dev/null 2>&1 && chmod +x ./scripts/deploy-blue-green.sh && ./scripts/deploy-blue-green.sh"
                '''
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE SUCCESS: All tests passed & Zero-Downtime Deploy completed!"
        }
        failure {
            echo "❌ PIPELINE FAILED: Build, Tests, or Deployment encountered errors."
        }
        always {
            echo "🧹 Cleanup after build completion."
        }
    }
}

