# Rizora AI

An AI-powered rice farm management platform that combines disease detection, real-time notifications, and stakeholder coordination to improve cultivation outcomes.

## Project Overview

Rizora AI is a final-year university project focused on modernizing rice cultivation workflows. It blends AI-driven disease detection with a full-stack web app to help farmers, millers, and agricultural officers collaborate around field data, market prices, and harvest operations.

## Key Features

### For Farmers

- AI-powered disease detection for rice leaves
- Treatment suggestions based on model results
- Real-time notifications for scan updates
- Harvest and market price awareness

### For Mills and Officers

- Centralized dashboards for farmer engagement
- Scan history and case follow-up workflows
- Market price updates and alerts
- Real-time messaging and notifications

### AI Capabilities

- CNN-based rice disease classification
- FastAPI inference service with image processing
- Historical scan tracking in MongoDB

## Tech Stack

### Frontend

- Next.js (App Router) + React 19
- Tailwind CSS + Radix UI
- Clerk authentication
- Recharts for data visualization

### Backend

- Next.js API routes
- MongoDB + Mongoose
- Pusher for realtime events
- Cloudinary for image storage

### ML Service

- FastAPI + Uvicorn
- TensorFlow/Keras
- Pillow + NumPy

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Python 3.9+

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Set these variables in your local environment:

```bash
MONGODB_URI=your_mongodb_connection_string
ML_SERVICE_URL=http://127.0.0.1:8000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

OFFICER_ADMIN_PASSWORD=your_officer_admin_password
```

If you are using Clerk, set the required Clerk environment variables from your dashboard.

### Start the ML Service

```bash
pip install -r src/ml-service/requirements.txt
uvicorn fastapi_app:app --app-dir src/ml-service --host 127.0.0.1 --port 8000 --reload
```

### Start the Web App

```bash
npm run dev
```

### Run Web + ML Together

```bash
npm run dev:all
```

Open http://localhost:3000 in your browser.

## API Routes (High Level)

- `POST /api/disease-detect` - run a rice leaf disease scan
- `GET /api/notifications` - fetch notification history
- `GET /api/market-prices` - list market prices
- `GET /api/chat` - list or send messages
- `POST /api/webhooks/clerk` - Clerk webhooks

See [src/app/api](src/app/api) for full route definitions.

## Testing

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:components
```

## Team

Final-year project developed by Kavishka Igalagama under the supervision of Ms. Dulanjali Wijesekara (NSBM partnership with Plymouth University).

## License

Academic project. All rights reserved.

## Acknowledgments

Thanks to academic supervisors, local rice sector partners, and the open source community.

This project is a final year submission for Plymouth University, Plymouth batch 12.
