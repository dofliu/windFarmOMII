import { describe, expect, it } from 'vitest';
import { canonicalJson, digestCanonical, sha256Hex } from './digest';

describe('Course Record digest', () => {
  it('matches Web Crypto SHA-256 for empty, short, multi-block, and non-ASCII inputs', async () => {
    const inputs = ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'x'.repeat(1000), '主軸承溫升與振動同時異常 🌊'];
    for (const input of inputs) {
      const reference = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      const expected = [...new Uint8Array(reference)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      expect(sha256Hex(input)).toBe(expected);
    }
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('canonicalizes key order and drops undefined so equal records hash equally', () => {
    const left = { b: [1, { z: 'x', y: undefined }], a: 'A', c: null };
    const right = { c: null, a: 'A', b: [1, { z: 'x' }] };
    expect(canonicalJson(left)).toBe('{"a":"A","b":[1,{"z":"x"}],"c":null}');
    expect(digestCanonical(left)).toBe(digestCanonical(right));
    expect(digestCanonical({ ...right, a: 'B' })).not.toBe(digestCanonical(right));
  });
});
