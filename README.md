# `reliable-random`

This is an implementation of [the PCG PRNG](https://www.pcg-random.org/) in
typescript. The advantages of this generator are outlined in more detail [on
their website](https://www.pcg-random.org/useful-features.html#id4), but here
are a few:

- Excellent statistical quality
- Challenging prediction difficulty
- Reproducible results (great for sharing!)
- Multiple streams
- Arbitrary period

## Installation

```
yarn install reliable-random
```

## Usage

The main draw for this package is the ability to produce random numbers from a
user-defined seed. 

The PCG implementation also allows multiple different streams of random numbers
from the same seed. This can be very helpful when creating games with a random
element to them ([roguelike
games](https://steveasleep.com/pcg32-the-perfect-prng-for-roguelikes.html) for
example) because the seeds can easily be shared with others.
