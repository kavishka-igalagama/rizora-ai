/\*\*

- Models Directory Tests
- Comprehensive tests for all MongoDB models
  \*/

// This directory contains validation tests for all data models:
// - User: Role-based user management, identity fields, onboarding
// - Message: Chat messaging, read status, conversation grouping
// - Notification: Alert types, metadata, user association
// - DiseaseScan: ML prediction results, scan status, image metadata
// - Pricing: Rice variety, quality grades, regional pricing

// Run specific model tests:
// npm run test:models
// npm test -- user.test.ts
// npm test -- message.test.ts
// npm test -- notification.test.ts
// npm test -- disease-scan.test.ts
// npm test -- pricing.test.ts

/\*\*

- API Directory Tests
- Comprehensive tests for all REST API endpoints
  \*/

// This directory contains integration tests for all API endpoints:
// - Disease Detection: ML prediction API, image upload, notifications
// - Market Prices: Price management, filtering, regional comparison
// - Notifications: User notifications, marking read, bulk sending
// - Chat: Messaging, typing status, contacts, presence
// - Officer: Dashboard, scan review, task management, reports
// - Pusher: Real-time events, channels, presence, broadcasting
// - Webhooks: Event handling, signature verification, retry logic

// Run specific API tests:
// npm run test:api
// npm test -- disease-detection.test.ts
// npm test -- market-prices.test.ts
// npm test -- notifications.test.ts
// npm test -- chat.test.ts
// npm test -- officer.test.ts
// npm test -- pusher.test.ts
// npm test -- webhooks.test.ts

/\*\*

- Quick Reference - All Test Commands
  \*/

/\*
UNIT TESTS (Utility Functions)
npm run test:unit

COMPONENT TESTS (React Components)
npm run test:components

INTEGRATION TESTS (Feature Workflows)
npm run test:integration

MODEL TESTS (Database Schemas)
npm run test:models

API TESTS (REST Endpoints)
npm run test:api

ALL TESTS WITH COVERAGE
npm run test:all
npm test -- --coverage

WATCH MODE
npm run test:watch
npm run test:watch -- --testPathPattern=models
npm run test:watch -- --testPathPattern=api

SPECIFIC TEST FILE
npm test -- user.test.ts
npm test -- disease-detection.test.ts

CUSTOM FILTER
npm test -- --testNamePattern="should create"
\*/
