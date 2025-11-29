/**
 * Dashboard Component Tests
 * 
 * Tests for the dynamic greeting feature:
 * - Time-based greeting display
 * - Username extraction from email
 * - Fallback behavior when no email
 * - Avatar initial display
 */

import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../pages/dashboard'
import { getAuth } from '../lib/auth'
import { useRequireAuth } from '../lib/useRequireAuth'
import { useTasks } from '../hooks/useTasks'

// Mock dependencies
jest.mock('../lib/auth')
jest.mock('../lib/useRequireAuth')
jest.mock('../hooks/useTasks')
jest.mock('../lib/api', () => ({
  api: {
    analytics: jest.fn(),
  },
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}))

// Mock components
jest.mock('../components/TaskBoard', () => {
  return function MockTaskBoard() {
    return <div data-testid="task-board">Task Board</div>
  }
})

jest.mock('../components/AddTaskModal', () => {
  return function MockAddTaskModal() {
    return <div data-testid="add-task-modal">Add Task Modal</div>
  }
})

describe('Dashboard Greeting', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Default mock implementations
    useRequireAuth.mockReturnValue(true)
    useTasks.mockReturnValue({
      groups: { todo: [], progress: [], done: [] },
      isLoading: false,
      isError: false,
      error: null,
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    })

    // Mock localStorage
    Storage.prototype.getItem = jest.fn()
    Storage.prototype.setItem = jest.fn()
    Storage.prototype.removeItem = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays greeting with username from email', async () => {
    // Mock auth with email
    getAuth.mockReturnValue({ email: 'rahul@example.com' })

    // Mock current time to be morning (10 AM)
    const mockDate = new Date('2024-01-15T10:00:00')
    const originalDate = global.Date
    global.Date = jest.fn(() => mockDate)
    global.Date.now = jest.fn(() => mockDate.getTime())

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toHaveTextContent('Good morning, Rahul')
    })

    global.Date = originalDate
  })

  test('displays correct greeting for afternoon', async () => {
    getAuth.mockReturnValue({ email: 'deepa@example.com' })

    // Mock current time to be afternoon (2 PM)
    const mockDate = new Date('2024-01-15T14:00:00')
    const originalDate = global.Date
    global.Date = jest.fn(() => mockDate)
    global.Date.now = jest.fn(() => mockDate.getTime())

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toHaveTextContent('Good afternoon, Deepa')
    })

    global.Date = originalDate
  })

  test('displays correct greeting for evening', async () => {
    getAuth.mockReturnValue({ email: 'john@example.com' })

    // Mock current time to be evening (7 PM)
    const mockDate = new Date('2024-01-15T19:00:00')
    const originalDate = global.Date
    global.Date = jest.fn(() => mockDate)
    global.Date.now = jest.fn(() => mockDate.getTime())

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toHaveTextContent('Good evening, John')
    })

    global.Date = originalDate
  })

  test('displays "Hello" for night time', async () => {
    getAuth.mockReturnValue({ email: 'alice@example.com' })

    // Mock current time to be night (11 PM)
    const mockDate = new Date('2024-01-15T23:00:00')
    const originalDate = global.Date
    global.Date = jest.fn(() => mockDate)
    global.Date.now = jest.fn(() => mockDate.getTime())

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toHaveTextContent('Hello, Alice')
    })

    global.Date = originalDate
  })

  test('falls back to "Hi, User" when no email is available', async () => {
    getAuth.mockReturnValue(null)

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toHaveTextContent('Hi, User')
    })
  })

  test('capitalizes username correctly', async () => {
    getAuth.mockReturnValue({ email: 'JOHN.DOE@example.com' })

    const mockDate = new Date('2024-01-15T10:00:00')
    const originalDate = global.Date
    global.Date = jest.fn(() => mockDate)
    global.Date.now = jest.fn(() => mockDate.getTime())

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      // Should be "John.doe" -> "John.doe" (first letter uppercase, rest lowercase)
      expect(greeting).toHaveTextContent('Good morning, John.doe')
    })

    global.Date = originalDate
  })

  test('displays avatar with correct initial', async () => {
    getAuth.mockReturnValue({ email: 'rahul@example.com' })

    render(<DashboardPage />)

    await waitFor(() => {
      // Avatar should show first letter of username
      const avatar = screen.getByText('R')
      expect(avatar).toBeInTheDocument()
    })
  })

  test('displays "U" in avatar when no email', async () => {
    getAuth.mockReturnValue(null)

    render(<DashboardPage />)

    await waitFor(() => {
      const avatar = screen.getByText('U')
      expect(avatar).toBeInTheDocument()
    })
  })

  test('has accessibility label on greeting', async () => {
    getAuth.mockReturnValue({ email: 'test@example.com' })

    render(<DashboardPage />)

    await waitFor(() => {
      const greeting = screen.getByLabelText('dashboard greeting')
      expect(greeting).toBeInTheDocument()
    })
  })
})

