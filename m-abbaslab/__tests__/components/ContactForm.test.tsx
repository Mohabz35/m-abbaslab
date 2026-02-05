import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactForm from '@/components/ContactForm'
import '@testing-library/jest-dom'

// Mock fetch for form submission
// @ts-ignore
global.fetch = jest.fn()

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } })
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message' } })

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('submits form successfully with valid data', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'General Inquiry' } })
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message' } })

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Message Sent!/i)).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('shows error message on submission failure', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message' } })

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    })
  })
})
