/**
 * FNV-1a (32 bit) with the murmur3 finaliser. FNV alone barely changes its output when only the
 * last character differs ("seed:1" vs "seed:2"), which would rank testimonials by id; the
 * finaliser spreads those bits.
 */
export const fnv1a = (input: string): number => {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/** Rendezvous score of one testimonial for one block seed. */
export const score = (seed: string, id: string): number => fnv1a(`${seed}:${id}`)
