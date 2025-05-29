import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import Home from './page'

// Mock the next/image component since we don't need to test images
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

describe('Homepage', () => {
  test('all links have href attributes', () => {
    // Arrange
    render(<Home />)

    // Act
    const links = screen.getAllByRole('link')

    // Assert
    links.forEach((link) => {
      expect(link).toHaveAttribute('href')
    })
  })
})
