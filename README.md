# `reliable-random`

This is an implementation of [the PCG32 PRNG](https://www.pcg-random.org/) in
typescript. The advantages of this generator are outlined in more detail [on
their website](https://www.pcg-random.org/useful-features.html#id4), but here
are a few:

- Excellent statistical quality
- Challenging prediction difficulty
- Reproducible results (great for sharing!)
- Multiple streams
- Arbitrary period
