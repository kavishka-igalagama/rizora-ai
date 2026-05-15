/**
 * Test Utilities and Helpers
 * Common functions for testing
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
})

export const createMockPost = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  author: createMockUser(),
  createdAt: new Date('2024-01-01'),
  ...overrides,
})

// Async utilities
export const waitFor = (
  callback: () => void,
  options?: { timeout?: number; interval?: number }
) => {
  return new Promise((resolve, reject) => {
    const timeout = options?.timeout ?? 1000
    const interval = options?.interval ?? 50
    let elapsed = 0

    const check = () => {
      try {
        callback()
        resolve(undefined)
      } catch (error) {
        elapsed += interval
        if (elapsed > timeout) {
          reject(error)
        } else {
          setTimeout(check, interval)
        }
      }
    }

    check()
  })
}

// API mocking utilities
export const mockFetch = (response: Record<string, unknown>, options?: { status?: number; ok?: boolean }) => {
  const status = options?.status ?? 200
  const ok = options?.ok ?? status === 200

  global.fetch = jest.fn(() =>
    Promise.resolve({
      status,
      ok,
      json: async () => response,
      text: async () => JSON.stringify(response),
    })
  ) as jest.Mock
}

export const mockFetchError = (message = 'Network error') => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(message))
  ) as jest.Mock
}

export const clearFetchMock = () => {
  jest.restoreAllMocks()
}

// Snapshot testing utilities
export const getComponentSnapshot = (component: ReactElement) => {
  const { container } = customRender(component)
  return container.firstChild
}

// Accessibility testing utilities
export const checkAccessibility = async (element: HTMLElement) => {
  // Basic accessibility checks
  const buttons = element.querySelectorAll('button')
  buttons.forEach((button) => {
    expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
  })

  const links = element.querySelectorAll('a')
  links.forEach((link) => {
    expect(link.href).toBeTruthy()
  })

  const images = element.querySelectorAll('img')
  images.forEach((img) => {
    expect(img.alt).toBeTruthy()
  })
}
