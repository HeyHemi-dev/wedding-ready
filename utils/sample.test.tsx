import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Button } from '@/components/ui/button'

test('Page', () => {
  render(<Button>Click</Button>)

  const button = screen.getByRole('button', { name: 'Click me' })

  expect(button).toBeInTheDocument()
})
