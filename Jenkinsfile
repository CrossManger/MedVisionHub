pipeline {
    agent any

    environment {
        APP_NAME = 'MedVisionHub'
        BACKEND_DIR = 'app/backend'
        FRONTEND_DIR = 'app/frontend'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "=== Stage 1: Checkout Code from Git ==="
                checkout scm
            }
        }

        stage('Run Backend Unit Tests') {
            steps {
                echo "=== Stage 2: Running Go Backend Unit Tests ==="
                dir("${env.BACKEND_DIR}") {
                    sh 'go test -v ./...'
                }
            }
        }

        stage('Run Frontend Build & Type Check') {
            steps {
                echo "=== Stage 3: Running Frontend Type Check and Build ==="
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npx tsc --noEmit'
                    sh 'npm run build'
                }
            }
        }

        stage('Verify Docker Compose Build') {
            steps {
                echo "=== Stage 4: Verifying Docker Compose Build ==="
                sh 'docker compose build'
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE SUCCESS: All tests and builds passed successfully!"
        }
        failure {
            echo "❌ PIPELINE FAILED: Build or Unit Tests encountered errors. Please check the logs."
        }
        always {
            echo "🧹 Cleanup after build completion."
        }
    }
}
