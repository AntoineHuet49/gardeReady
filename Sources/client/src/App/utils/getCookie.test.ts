import { describe, expect, it } from 'vitest'
import { getAllCookie, removeCookie } from './getCookie'

describe('getCookie', () => {
  it('lit puis supprime un cookie', () => {
    document.cookie = 'token=abc'
    expect(getAllCookie().token).toBe('abc')
    removeCookie('token')
    expect(getAllCookie().token).toBeUndefined()
  })
})
