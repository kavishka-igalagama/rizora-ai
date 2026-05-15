# Testing Guide

This project includes comprehensive testing setup with unit tests, component tests, and integration tests.

## Test Structure

```
src/__tests__/
├── unit/              # Unit tests for utilities and functions
├── components/        # Component tests for React components
└── integration/       # Integration tests for features
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Run specific test suites

```bash
# Unit tests only
npm run test:unit

# Component tests only
npm run test:components

# Integration tests only
npm run test:integration
```

## Test Types

### 1. Unit Tests (`src/__tests__/unit/`)

Tests for individual functions and utilities in isolation.

**Examples:**

- `utils.test.ts` - Tests for className merging utility
- `validation.test.ts` - Tests for validation functions

**Best practices:**

- Test functions with various inputs
- Mock external dependencies
- Keep tests focused on single functionality

### 2. Component Tests (`src/__tests__/components/`)

Tests for individual React components.

**Examples:**

- `button.test.tsx` - Tests for Button component
- `form.test.tsx` - Tests for form components with validation
- `navbar.test.tsx` - Tests for navigation component

**Best practices:**

- Test component rendering
- Test user interactions
- Test different props/states
- Use React Testing Library queries

### 3. Integration Tests (`src/__tests__/integration/`)

Tests for multiple components working together and API interactions.

**Examples:**

- `login-flow.test.tsx` - Tests for complete login feature
- `api-integration.test.tsx` - Tests for API integration

**Best practices:**

- Test user workflows
- Mock API calls
- Test component interactions
- Verify state changes

## Writing New Tests

### Basic Test Template

```typescript
describe("Component/Function Name", () => {
  it("should do something", () => {
    // Arrange
    const expected = "value";

    // Act
    const result = myFunction();

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/text/i)).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText(/clicked/i)).toBeInTheDocument()
  })
})
```

## Testing Library Queries

When testing React components, use queries in this order:

1. **getByRole** - Most semantic, recommended

   ```typescript
   screen.getByRole("button", { name: /submit/i });
   ```

2. **getByLabelText** - Great for form fields

   ```typescript
   screen.getByLabelText(/email/i);
   ```

3. **getByPlaceholderText** - For inputs without labels

   ```typescript
   screen.getByPlaceholderText("Enter email");
   ```

4. **getByTestId** - Last resort
   ```typescript
   screen.getByTestId("submit-button");
   ```

## Mocking

### Mock a module

```typescript
jest.mock("@/lib/api", () => ({
  fetchData: jest.fn(),
}));
```

### Mock fetch

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: "test" }),
  }),
);
```

### Mock function with implementation

```typescript
const mockFn = jest.fn((arg) => {
  if (arg === "error") throw new Error("Error");
  return "success";
});
```

## Coverage Goals

This project maintains minimum coverage thresholds:

- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 50%
- **Statements:** 50%

To improve coverage, check the coverage report:

```bash
npm run test:coverage
```

## Common Patterns

### Testing async operations

```typescript
it('should handle async operations', async () => {
  const user = userEvent.setup()
  render(<Component />)

  await user.click(screen.getByRole('button'))

  // Wait for async operation
  const result = await screen.findByText(/loaded/i)
  expect(result).toBeInTheDocument()
})
```

### Testing with React Hook Form

```typescript
it('should validate form', async () => {
  const user = userEvent.setup()
  render(<FormComponent />)

  const input = screen.getByLabelText(/email/i)
  await user.type(input, 'invalid')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
```

### Testing with Zustand/Redux store

```typescript
const mockStore = {
  state: { count: 0 },
  increment: jest.fn(),
};

jest.mock("@/lib/store", () => ({
  useStore: () => mockStore,
}));
```

## Debugging Tests

### Run a single test

```bash
npm test -- button.test.tsx
```

### Run tests matching a pattern

```bash
npm test -- --testNamePattern="should render"
```

### Debug mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD Integration

For GitHub Actions or similar CI systems:

```yaml
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
