# Models & API Testing Guide

Complete testing documentation for all models and API endpoints in the Rizora AI project.

## Test Structure

```
src/__tests__/
├── models/                    # Model validation tests
│   ├── user.test.ts
│   ├── message.test.ts
│   ├── notification.test.ts
│   ├── disease-scan.test.ts
│   └── pricing.test.ts
├── api/                       # API endpoint tests
│   ├── disease-detection.test.ts
│   ├── market-prices.test.ts
│   ├── notifications.test.ts
│   ├── chat.test.ts
│   ├── officer.test.ts
│   ├── pusher.test.ts
│   └── webhooks.test.ts
```

## Models Testing

### User Model Tests

**File:** `src/__tests__/models/user.test.ts`

Tests for user validation and role-based fields:

- User creation with required fields
- Role enum validation (farmer, mill, officer, none)
- Role-specific fields (farmer, mill, officer)
- Identity field uniqueness (clerkId, email)
- Email format validation
- Phone format validation
- Onboarding status tracking
- Timestamps (createdAt, updatedAt)

```typescript
// Example: Test farmer-specific fields
const farmer = createMockUser({ role: "farmer" });
expect(farmer.firstName).toBeDefined();
expect(farmer.district).toBeDefined();
expect(farmer.nic).toBeDefined();
```

### Message Model Tests

**File:** `src/__tests__/models/message.test.ts`

Tests for message schema validation:

- Message creation with required fields
- Unique message ID generation
- Body max length enforcement (2000 chars)
- Message body trimming
- Sender/recipient ID tracking
- Read status tracking (readAt)
- Conversation grouping
- Timestamps ordering

```typescript
// Example: Test read status
const unreadMessage = createMockMessage({ readAt: null });
const readMessage = createMockMessage({ readAt: new Date() });
expect(unreadMessage.readAt).toBeNull();
expect(readMessage.readAt).toBeInstanceOf(Date);
```

### Notification Model Tests

**File:** `src/__tests__/models/notification.test.ts`

Tests for notification types and metadata:

- Notification type support (alert, market, message, system)
- Title and description requirements
- Read status tracking
- Metadata storage (disease, confidence, imageUrl)
- Notification recipient association
- Confidence range validation (0-100)
- Timestamps

```typescript
// Example: Test notification types
const notification = createMockNotification({
  type: "alert",
  metadata: {
    disease: "Rice Leaf Blast",
    confidence: 92.5,
  },
});
expect(notification.type).toBe("alert");
```

### DiseaseScan Model Tests

**File:** `src/__tests__/models/disease-scan.test.ts`

Tests for disease detection scan validation:

- Scan creation with required fields
- Confidence score validation (0-100)
- Disease name storage
- Treatment suggestions (non-empty array)
- Scan status (pending, reviewed, escalated)
- Review information (reviewedBy, officerNotes)
- Image metadata (url, publicId, format, size, dimensions)
- Anonymous scan support
- Timestamps

```typescript
// Example: Test scan status transitions
const scan = createMockDiseaseScan({ scanStatus: "pending" });
expect(["pending", "reviewed", "escalated"]).toContain(scan.scanStatus);
```

### Pricing Model Tests

**File:** `src/__tests__/models/pricing.test.ts`

Tests for rice pricing information:

- Price record creation
- Quality grade validation (Grade A, B, C, D)
- Price per kg (decimal support)
- Rice variety support
- Regional pricing
- Mill association
- Active/inactive status
- Optional notes
- Variety + grade + region uniqueness

```typescript
// Example: Test quality grades
const grades = ["Grade A", "Grade B", "Grade C", "Grade D"];
grades.forEach((grade) => {
  const pricing = createMockPricing({ qualityGrade: grade });
  expect(["Grade A", "Grade B", "Grade C", "Grade D"]).toContain(
    pricing.qualityGrade,
  );
});
```

## API Endpoints Testing

### Disease Detection API

**File:** `src/__tests__/api/disease-detection.test.ts`

Tests for ML-based disease detection:

- Image file upload validation
- File type and size validation
- Disease prediction with confidence scores
- Treatment suggestion generation
- Scan database storage
- User notification on detection
- Scan status tracking (pending, reviewed, escalated)
- Confidence level handling (high, medium, low)

**Key Tests:**

- Valid/invalid image format detection
- Max file size enforcement (10MB)
- Disease prediction accuracy
- Treatment suggestion provision
- Anonymous scan handling

### Market Prices API

**File:** `src/__tests__/api/market-prices.test.ts`

Tests for rice market pricing:

- Get all prices
- Filter by variety, region, grade
- Create new price record
- Update existing price
- Price history retrieval
- Price validation (positive, decimal)
- Multiple prices per mill
- Grade-based price differentiation
- Regional price comparison

**Key Tests:**

- Filter combination support
- Price trend analysis
- Active/inactive status tracking
- Bulk order notes
- Regional price variations

### Notifications API

**File:** `src/__tests__/api/notifications.test.ts`

Tests for user notifications:

- Get user notifications
- Unread count tracking
- Mark single/all as read
- Create notifications (alert, market, message, system)
- Delete notifications
- Bulk notification sending
- Notification filtering (type, read status)
- Notification metadata support

**Key Tests:**

- Disease alert notifications
- Market price change notifications
- Message notifications
- System notifications
- Notification grouping by user

### Chat API

**File:** `src/__tests__/api/chat.test.ts`

Tests for messaging functionality:

- Send text messages
- Get conversation messages
- Mark messages as read
- Delete messages
- Add/manage contacts
- Favorite contacts
- Typing status broadcast
- Typing user detection
- Message pagination
- Conversation grouping
- Message search

**Key Tests:**

- Empty message rejection
- Max message length (2000 chars)
- Emoji support
- Contact ordering
- Typing status timeout
- Read receipt tracking

### Officer API

**File:** `src/__tests__/api/officer.test.ts`

Tests for agricultural officer features:

- Officer dashboard data
- Pending scans review
- Scan status transitions
- Task management (create, get)
- Task priority levels
- Farmer notifications
- Monthly/quarterly/annual reports
- Disease breakdown statistics
- District management

**Key Tests:**

- Pending scans retrieval
- Scan review workflow
- Scan escalation
- Officer task creation
- Report generation with disease breakdown
- Farmer notification delivery

### Pusher API (Real-time)

**File:** `src/__tests__/api/pusher.test.ts`

Tests for real-time features:

- Event broadcasting on channels
- Typing status broadcasting
- Message broadcasting
- User notifications
- Price update broadcasting
- Channel subscriptions
- Presence tracking
- Connection status
- Real-time message updates

**Key Tests:**

- Chat channel events
- Presence channel presence users
- Private channel notifications
- Public price update channel
- Rapid message broadcasting
- Typing status real-time updates

### Webhooks API

**File:** `src/__tests__/api/webhooks.test.ts`

Tests for webhook integrations:

- Clerk webhook handling (user.created, user.updated)
- Svix webhook handling
- Signature verification
- Event logging
- Retry logic (max 3 retries)
- Payment webhook handling
- Multiple event types support
- Delivery status tracking
- Error handling
- Security (signature, timestamp validation)

**Key Tests:**

- User creation webhook
- User update webhook
- Signature verification
- Malformed payload handling
- Replay attack prevention
- Failed webhook retry

## Running Model & API Tests

### Run specific test categories

```bash
# Model tests
npm test -- src/__tests__/models

# API tests
npm test -- src/__tests__/api

# Specific model
npm test -- user.test.ts

# Specific API
npm test -- disease-detection.test.ts
```

### Run with coverage

```bash
npm run test:coverage -- src/__tests__/models
npm run test:coverage -- src/__tests__/api
```

### Watch mode

```bash
npm run test:watch -- src/__tests__/models
npm run test:watch -- src/__tests__/api
```

## Test Coverage Goals

- **Models:** 80%+ coverage
- **API:** 75%+ coverage
- **Overall:** 70%+ coverage

## Common Testing Patterns

### Model Validation Test

```typescript
const createMockModel = (overrides?: Partial<IModel>): Partial<IModel> => ({
  // Default values
  ...overrides,
});

describe("Model Tests - ModelName", () => {
  it("should create model with required fields", () => {
    const model = createMockModel();
    expect(model.requiredField).toBeDefined();
  });
});
```

### API Endpoint Test

```typescript
const mockService = {
  method: async (params: any) => {
    return { success: true, ...result };
  },
};

describe("API Tests - EndpointName", () => {
  it("should call endpoint", async () => {
    const result = await mockService.method({ param: "value" });
    expect(result.success).toBe(true);
  });
});
```

## Best Practices

1. **Use factory functions** for creating mock data
2. **Test validation** at schema level
3. **Test all enum values** for fields
4. **Verify relationships** between models
5. **Test error cases** and edge conditions
6. **Use descriptive test names** that explain what is being tested
7. **Group related tests** with describe blocks
8. **Mock external services** (ML service, Pusher, etc.)
9. **Test data consistency** (timestamps, relationships)
10. **Verify optional fields** are truly optional

## CI/CD Integration

Tests run automatically on:

- Every push to main/develop
- Every pull request
- Manual workflow dispatch

See [.github/workflows/tests.yml](.github/workflows/tests.yml)

## Debugging Tests

```bash
# Run single test file
npm test -- user.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run with verbose output
npm test -- --verbose
```

## Related Documentation

- [TESTING.md](./TESTING.md) - General testing setup and guide
- [jest.config.ts](./jest.config.ts) - Jest configuration
- [jest.setup.ts](./jest.setup.ts) - Test environment setup

## Contact & Support

For questions about model or API testing, refer to:

- Model definitions in `src/lib/models/`
- API routes in `src/app/api/`
- Test files in `src/__tests__/`
