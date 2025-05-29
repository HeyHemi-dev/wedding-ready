import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, afterEach } from 'vitest'

import Home from './page'

// Mock the next/image component since we don't need to test images
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

describe('Homepage', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

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

  test('has correct heading hierarchy', () => {
    // Arrange
    render(<Home />)

    // Act
    const headings = screen.getAllByRole('heading')
    const headingLevels = headings.map((h) => parseInt(h.tagName[1]))

    // Assert
    // Check for exactly one h1
    expect(headingLevels.filter((level) => level === 1)).toHaveLength(1)

    // Check for no skipped levels in sequence
    let previousLevel = headingLevels[0]
    for (const level of headingLevels.slice(1)) {
      expect(level - previousLevel).toBeLessThanOrEqual(1)
      previousLevel = level
    }
  })

  test('all images have meaningful alt text', () => {
    // Arrange
    render(<Home />)

    // Act
    const images = screen.getAllByRole('img')

    // Assert
    images.forEach((image) => {
      const alt = image.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt).not.toBe('')
      // Alt text should be descriptive and not just decorative
      expect(alt?.length).toBeGreaterThan(3)
    })
  })
})
