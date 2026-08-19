import { describe, expect, it } from 'vitest'
import { sanitizeLabel } from './llm'

describe('LLM privacy sanitization', () => {
  it('removes phone numbers and email addresses from transaction labels', () => {
    expect(sanitizeLabel('Payment +256700123456')).toBe('Payment')
    expect(sanitizeLabel('Invoice brian@example.com')).toBe('Invoice')
  })

  it('removes person-specific for/via suffixes and prefixes', () => {
    expect(sanitizeLabel('Money for Sarah Jones')).toBe('Money')
    expect(sanitizeLabel('For Sarah Jones')).toBe('')
    expect(sanitizeLabel('Money via Mobile Money')).toBe('Money')
    expect(sanitizeLabel('Via Sarah')).toBe('')
  })
})
