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
                    HOST_PATH="/home/minhvh/jenkins_data/workspace/${JOB_NAME}/app/backend"
                    docker run --rm -v "${HOST_PATH}":/app -w /app golang:alpine go test -v ./...
                '''
            }
        }

        stage('Run Frontend Build & Type Check') {
            steps {
                echo "=== Stage 3: Running Frontend Type Check & Build in Isolated Docker Container ==="
                sh '''
                    HOST_PATH="/home/minhvh/jenkins_data/workspace/${JOB_NAME}/app/frontend"
                    docker run --rm -v "${HOST_PATH}":/app -w /app node:22-alpine sh -c "npm install && npx tsc --noEmit && npm run build"
                '''
            }
        }

        stage('Verify Docker Compose Build') {
            steps {
                echo "=== Stage 4: Verifying Docker Compose Build ==="
                sh '''
                    HOST_PATH="/home/minhvh/jenkins_data/workspace/${JOB_NAME}"
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "${HOST_PATH}":/app -w /app docker:cli docker compose build
                '''
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE SUCCESS: All tests and builds passed successfully!"
        }
        failure {
            echo "❌ PIPELINE FAILED: Build or Unit Tests encountered errors."
        }
        always {
            echo "🧹 Cleanup after build completion."
        }
    }
}
