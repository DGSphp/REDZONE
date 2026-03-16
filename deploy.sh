#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"red-zone-484705"}
REGION="us-central1"
SERVICE_NAME="redzone-app"

echo "Deploying $SERVICE_NAME to project $PROJECT_ID in region $REGION..."

# Build and push the image to Artifact Registry or GCR
# (Assuming Arifact Registry is set up, or using Google's default)
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME . --project $PROJECT_ID

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  --set-env-vars "INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME,DB_USER=$DB_USER,DB_NAME=$DB_NAME,NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL" \
  --set-secrets "DB_PASSWORD=DB_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest"

echo "Deployment complete!"
