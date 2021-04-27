/**
 * A random constant that is part of the random generation algorithm.
 */
const RANDOM_CONSTANT = BigInt('6364136223846793005')
/**
 * A mask of 32 set bits. Used to ensure values stay within a 32 bit range.
 */
const U32_MASK = (BigInt(1) << BigInt(32)) - BigInt(1)
/**
 * A mask of 64 set bits. Used to ensure values stay within a 64 bit range.
 */
const U64_MASK = (BigInt(1) << BigInt(64)) - BigInt(1)

export default class PCG32 {
  private _state: bigint
  private _inc: bigint

  // The state and sequence are stored as bigints, but anything that is
  // coercible to a bigint should be a valid seed.
  constructor(
    initState: Parameters<BigIntConstructor>[0],
    initSequence: Parameters<BigIntConstructor>[0]
  ) {
    this._state = BigInt(0)
    this._inc = ((BigInt(initSequence) << BigInt(1)) | BigInt(1)) & U64_MASK
    this._random_b()
    this._state = (this._state + BigInt(initState)) & U64_MASK
    this._random_b()
  }

  /**
   * This is the source of randomness for all other random methods.
   *
   * Produces a uniformly distributed 32-bit unsigned integer as a bigint.
   *
   * Although the produced number is 32 bits; the implementation requires that
   * the state of the generator be a 64 bit unsigned integer. Since the js
   * Number datatype cannot reliably handle integers that large, we use the
   * BigInt class for the calculation.
   */
  _random_b(): bigint {
    const old = this._state

    this._state = (old * RANDOM_CONSTANT + this._inc) & U64_MASK

    const xorshifted = ((old >> BigInt(18)) ^ old) >> BigInt(27)
    const rightRot = old >> BigInt(59)
    const leftRot = rightRot ^ BigInt(31)

    return ((xorshifted >> rightRot) | (xorshifted << leftRot)) & U32_MASK
  }

  /**
   * Advances the internal state of the generator `delta` steps. Delta can be
   * negative to reverse.
   *
   * This is calculated in a very similar way to the square and multiply method
   * for taking the power of a number. As you may expect, it is calculated in
   * log(delta) time.
   */
  _advance(delta: bigint): void {
    // The period is 2 ^ 64.
    delta &= U64_MASK
    // If delta is negative, we make it positive and go around the other way.
    if (delta < 0) {
      delta = U64_MASK ^ -delta
    }

    /** The accumulated multiplier */
    let mult_acc = BigInt(1)
    /** The current multiplier */
    let mult_curr = RANDOM_CONSTANT

    /** The accumulated increment */
    let plus_acc = BigInt(0)
    let plus_curr = this._inc

    while (delta > 0) {
      if (delta & BigInt(1)) {
        mult_acc = (mult_acc * mult_curr) & U64_MASK
        plus_acc = (plus_acc * mult_curr + plus_curr) & U64_MASK
      }
      plus_curr = ((mult_curr + BigInt(1)) * plus_curr) & U64_MASK
      mult_curr = (mult_curr * mult_curr) & U64_MASK
      delta >>= BigInt(1)
    }

    this._state = (mult_acc * this._state + plus_acc) & U64_MASK
  }

  /**
   * Produces a uniformly distributed integer, r, with 0 ≤ r < bound.
   *
   * To produce a uniformly distributed integer in the range [low, high):
   *
   * ```js
   * const i = low + rand.randint(high - low)
   * ```
   *
   * @param bound The lower bound for the number.
   */
  randint(bound: number): number {
    if (bound > U32_MASK) {
      throw new TypeError(`Bound too large: ${bound}`)
    }
    if (bound <= 0) {
      throw new TypeError(`Empty sample space for r: 0 ≤ r < ${bound}`)
    }
    const bound_big = BigInt(bound)

    // By excluding the integers less than this threshold, we can be sure that
    // the final value will be uniformly distributed in the intended range.
    const threshold = (U32_MASK ^ bound_big) % bound_big

    // The uniformity of _random_b makes sure that this loop will exit
    // eventually.
    for (;;) {
      const r = this._random_b()
      if (r >= threshold) {
        return Number(r % bound_big)
      }
    }
  }

  /**
   * Generates an approximately uniformly distributed number, r, with 0 ≤ r < 1.
   *
   * @returns The number r.
   */
  random(): number {
    return Number(this._random_b()) / Math.pow(2, 32)
  }
}
