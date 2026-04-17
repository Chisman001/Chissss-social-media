import { describe, expect, it } from "vitest"

import { getSafeCallbackUrl } from "./safe-callback-url"

describe("getSafeCallbackUrl", () => {
  it("defaults for null and empty", () => {
    expect(getSafeCallbackUrl(null)).toBe("/feed")
    expect(getSafeCallbackUrl(undefined)).toBe("/feed")
    expect(getSafeCallbackUrl("")).toBe("/feed")
    expect(getSafeCallbackUrl("   ")).toBe("/feed")
  })

  it("allows exact app paths and query", () => {
    expect(getSafeCallbackUrl("/feed")).toBe("/feed")
    expect(getSafeCallbackUrl("/feed?tab=1")).toBe("/feed?tab=1")
    expect(getSafeCallbackUrl("/settings")).toBe("/settings")
    expect(getSafeCallbackUrl("/notifications")).toBe("/notifications")
  })

  it("allows profile and post paths", () => {
    expect(getSafeCallbackUrl("/u/alice")).toBe("/u/alice")
    expect(getSafeCallbackUrl("/u/alice?x=1")).toBe("/u/alice?x=1")
    expect(getSafeCallbackUrl("/post/clxyz123")).toBe("/post/clxyz123")
  })

  it("rejects external and protocol-relative URLs", () => {
    expect(getSafeCallbackUrl("https://evil.com")).toBe("/feed")
    expect(getSafeCallbackUrl("//evil.com")).toBe("/feed")
    expect(getSafeCallbackUrl("/\\evil.com")).toBe("/feed")
    expect(getSafeCallbackUrl("javascript:alert(1)")).toBe("/feed")
  })

  it("rejects path with scheme-like colon before query", () => {
    expect(getSafeCallbackUrl("/https://evil.com")).toBe("/feed")
  })

  it("decodes safe encoded paths", () => {
    expect(getSafeCallbackUrl("%2Ffeed")).toBe("/feed")
    expect(getSafeCallbackUrl("%2Fu%2Fbob")).toBe("/u/bob")
  })

  it("rejects encoded open redirect", () => {
    expect(getSafeCallbackUrl("%2F%2Fevil.com")).toBe("/feed")
    expect(getSafeCallbackUrl("https%3A%2F%2Fevil.com")).toBe("/feed")
  })

  it("rejects bare /u/ and /post/", () => {
    expect(getSafeCallbackUrl("/u/")).toBe("/feed")
    expect(getSafeCallbackUrl("/post/")).toBe("/feed")
  })
})
