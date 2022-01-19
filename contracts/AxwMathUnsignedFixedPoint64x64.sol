pragma solidity ^0.8.0;
// ----------------------------------------------------------------------------
// SPDX-License-Identifier: MIT
// A unsigned fixed point 64.64 math library that calculates
//   - log base 1.0001
//   - log base 10
//   - log base 2
//   - log base 0.5
//   - normalized exponent
//   - power base 2
//   - power
//   - square root
// Auther: Alex W.(https://github.com/nonstopcoderaxw)
//
// Inspired by Mikhail Vladimirov's ABDKMath64x64.sol. Many thanks.
// ----------------------------------------------------------------------------
library AxwMathUnsignedFixedPoint64x64 {

    uint128 constant private one_64x64 = 0x10000000000000000;
    uint256 constant private one_64x128 = 0x100000000000000000000000000000000;
    uint128 constant private two_64x64 = 0x20000000000000000;
    uint128 constant private num_64_64x64 = 0x400000000000000000;
    uint128 constant private num_0_5_64x64 = 0x8000000000000000;
    uint128 constant private log_base_10_of_2_64x64 = 5553023288523357132;
    uint128 constant private log_base_1_0001_of_2_64x64 = 127869479436828503936251;
    uint128 constant private pow_base_2_of_64 = 18446744073709551616;

    error MustBeGreaterThanOrEqualsToOne(uint128);
    error MustBeLessThanTwo(uint128);
    error MustBeGreaterThanOne(uint128);
    error MustBeGreaterThanZero(uint128);
    error MustBeLessThanOne(uint128);
    error MustBeLessThan64(uint128);

    /// @dev log base 2 of x (x >= 1)
    ///      when 0 < x < 1, the result will be a negative number
    ///      so unsigned fixed point doesn't support
    /// @param x_64x64 x in q64.64 unsigned fixed point
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function log_base_2(uint128 x_64x64) internal pure returns (uint128 result_64x64){
        if(x_64x64 == one_64x64) return 0;
        if(x_64x64 < one_64x64) revert MustBeGreaterThanOne(x_64x64);

        uint8 integral = normalized_exponent(x_64x64);
        uint128 mantissa_1x64 = x_64x64 >> integral;
        uint128 fractional_64x64 = log_base_2_of_fraction(mantissa_1x64);
        result_64x64 = (uint128(integral) << 64) + fractional_64x64;
    }

    /// @dev log base 10 of x (x >= 1)
    ///      when 0 < x < 1, the result will be a negative number
    ///      so unsigned fixed point doesn't support
    /// @param x_64x64 x in q64.64 unsigned fixed point
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function log_base_10(uint128 x_64x64) internal pure returns (uint128 result_64x64){
        if(x_64x64 == one_64x64) return 0;
        if(x_64x64 < one_64x64) revert MustBeGreaterThanOne(x_64x64);

        uint128 log_base_2_of_x_64x64 = log_base_2(x_64x64);
        result_64x64 = uint128(
            uint256(log_base_10_of_2_64x64)
              * uint256(log_base_2_of_x_64x64)
              / uint256(pow_base_2_of_64)
        );
    }

    /// @dev log base 1.0001 of x
    ///      used by uniswap v3 tick math
    ///      (log base 1.0001 of x) = (log base 2 of x) * factor
    ///      factor = (log base 1.0001 of 2)
    ///      when 0 < x < 1, the result will be a negative number
    ///      so unsigned fixed point doesn't support
    /// @param x_64x64 x in q64.64 unsigned fixed point
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function log_base_1_0001(uint128 x_64x64) internal pure returns (uint128 result_64x64) {
        if(x_64x64 == one_64x64) return 0;
        if(x_64x64 < one_64x64) revert MustBeGreaterThanOne(x_64x64);

        uint128 log_base_2_of_x_64x64 = log_base_2(x_64x64);
        result_64x64 = uint128(
            uint256(log_base_1_0001_of_2_64x64)
              * uint256(log_base_2_of_x_64x64)
              / uint256(pow_base_2_of_64)
        );
    }

    /// @dev log0.5(x) = log2(x) / log2(0.5)
    ///                = log2(x) / - 1
    ///                = (log2(x * 2**64) - log2(2**64)) / -1
    ///                = 64 - log2(x * 2**64) (0 < x <= 1)
    /// @param x_64x64 x in q64.64 unsigned fixed point
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function log_base_0_5(uint128 x_64x64) internal pure returns (uint128 result_64x64) {
        if(x_64x64 == 0) revert MustBeGreaterThanZero(x_64x64);
        if(x_64x64 > one_64x64) revert MustBeLessThanOne(x_64x64);
        if(x_64x64 == one_64x64) return 0;

        return num_64_64x64 - log_base_2(x_64x64 << 64);
    }

    /// @notice aka. log base 2 rounding down
    /// @dev x = mantissa + pow(2, exponent); x = integral + fractional
    /// @param x_64x64 the q64.64 unsigned fixed point number
    /// @return exponent range from 0 to 255
    function normalized_exponent(uint128 x_64x64) internal pure returns (uint8 exponent) {
        uint64 integral = uint64(x_64x64 >> 64);

        if (integral > 0xFFFFFFFF) {
            integral >>= 32;
            exponent += 32;
        }

        if (integral > 0xFFFF) {
            integral >>= 16;
            exponent += 16;
        }

        if (integral > 0xFF) {
            integral >>= 8;
            exponent += 8;
        }

        if (integral > 0xF) {
            integral >>= 4;
            exponent += 4;
        }

        if (integral >= 0x4) {
            integral >>= 2;
            exponent += 2;
        }

        if (integral >= 0x2) {
            exponent += 1;
        }
    }

    /// @dev log base 2 of a number btw 1(inclusive) and 2(exclusive)
    /// @param fractional_64x64 a q64.64 unsigned fixed point number btw 1(inclusive) and 2(exclusive)
    /// @return result_64x64 a decimal between 0 and 1
    ///                      in a q64.64 unsigned fixed point number
    function log_base_2_of_fraction(uint128 fractional_64x64) internal pure returns (uint128 result_64x64) {

        if(fractional_64x64 == one_64x64) return 0;
        if(fractional_64x64 < one_64x64) revert MustBeGreaterThanOrEqualsToOne(fractional_64x64);
        if(fractional_64x64 >= two_64x64) revert MustBeLessThanTwo(fractional_64x64);

        uint256 fractional_64x64_256bit = uint256(fractional_64x64);
        for (uint128 delta = one_64x64 ; delta > 0; delta >>= 1) {
            if(fractional_64x64_256bit >= uint256(two_64x64)){
                result_64x64 += delta;
                fractional_64x64_256bit >>= 1;
            }
            // won't overflow
            // because max(fractional_64x64_256bit * fractional_64x64_256bit) is 130 bits
            fractional_64x64_256bit = (fractional_64x64_256bit * fractional_64x64_256bit) >> 64;
        }
    }

    /// @dev pow(2, fractional) = mul of (each significant bit of the fraction in binary * pow(2, bitIndex));
    ///      pow(2, bitIndex) has been recomputed
    ///      bitIndex here must be a negative number  (-1 >= bitIndex >= -64)
    /// @param x_64x64 the q64.64 unsigned fixed point number
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function pow_base_2_of_fraction(uint128 x_64x64) internal pure returns (uint128 result_64x64) {
        if(x_64x64 >= one_64x64) revert MustBeLessThanOne(x_64x64);
        if(x_64x64 == 0) revert MustBeGreaterThanZero(x_64x64);

        result_64x64 = one_64x64;
        uint128 bit_checker = 0x8000000000000000;
        int8 bit_index = -1;
        while (bit_index > -64) {
            if (x_64x64 & bit_checker != 0) {
                result_64x64 = uint128(
                  uint256(result_64x64)
                    * uint256(cached_power_base_2_of_negative_integer_64x64(
                        uint8(-bit_index - 1)
                      ))
                    / uint256(one_64x64)
                  );
            }
            bit_checker >>= 1;
            bit_index--;
        }
    }

    /// @dev power base 2 of x = power base 2 of (integral + fractional)
    ///                        = pow(2, integral) * pow(2, fractional)
    ///      pow(2, fractional) can be calculated by function pow_base_2_of_fraction
    ///      x must be less or equals to 63.99 because a 64.64 fixed point can only hold up to 2**64(exclusive)
    /// @param x_64x64 the q64.64 unsigned fixed point number
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function pow_base_2(uint128 x_64x64) internal pure returns (uint128 result_64x64) {
        if(x_64x64 > 0x3FFFFFFFFFFFFFFFFF) revert MustBeLessThan64(x_64x64);

        uint128 integral = x_64x64 >> 64;
        uint128 fraction = x_64x64 & 0x0000000000000000FFFFFFFFFFFFFFFF;

        uint256 pow_base_2_of_integral_64x64 = uint256(1) << (integral + 64);
        uint256 pow_base_2_of_fraction_64x64 = fraction == 0 ? one_64x64 : pow_base_2_of_fraction(fraction);
        return uint128(
            pow_base_2_of_integral_64x64 * pow_base_2_of_fraction_64x64
            >> 64
        );
    }

    /// @dev pow(base, exp) = pow(2, exp*log2(base)) (base > 1)
    ///      pow(base, exp) = 1 / pow(2, exp*log0.5(base)) (0 < base < 1)
    /// @param base_64x64 power base as q64.64 unsigned fixed point number
    /// @param exp_64x64 exponent as q64.64 unsigned fixed point number
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function pow(
        uint128 base_64x64,
        uint128 exp_64x64
    ) internal pure returns (uint128 result_64x64) {
        if(base_64x64 == 0) return 0;

        if(base_64x64 > one_64x64) {
            result_64x64 = pow_base_2(
                uint128(
                    uint256(log_base_2(base_64x64)) * uint256(exp_64x64) >> 64
                )
            );
        } else if(base_64x64 < one_64x64) {
            result_64x64 = uint128(
                one_64x128 /
                    uint256(
                        pow_base_2(
                            uint128(
                                uint256(log_base_0_5(base_64x64)) * uint256(exp_64x64) >> 64
                            )
                        )
                    )
            );
        } else if (base_64x64 == one_64x64){
            return one_64x64;
        }
    }

    /// @dev sqrt(x) = pow(x, 0.5)
    /// @param x_64x64 the q64.64 unsigned fixed point number
    /// @return result_64x64 the result in q64.64 unsigned fixed point
    function sqrt(uint128 x_64x64) internal pure returns (uint128 result_64x64) {
        result_64x64 = pow(x_64x64, num_0_5_64x64);
    }

    /// @dev recomputed power(2, x) (-1 <= x <= -64)
    /// @param index the index of the array that stores all the recomputed result
    /// @return a precomputed result
    function cached_power_base_2_of_negative_integer_64x64(
        uint8 index
    ) private pure returns (uint128) {
          return [
              0x16A09E667F3BCD000, 0x1306FE0A31B715000, 0x1172B83C7D517B000,
              0x10B5586CF9890F000, 0x1059B0D3158574000, 0x102C9A3E778061000,
              0x10163DA9FB3335000, 0x100B1AFA5ABCBF000, 0x10058C86DA1C0A000,
              0x1002C605E2E8CF000, 0x100162F3904052000, 0x1000B175EFFDC7000,
              0x100058BA01FBA0000, 0x10002C5CC37DA9000, 0x1000162E525EE0000,
              0x10000B17255776000, 0x1000058B91B5BD000, 0x100002C5C89D5F000,
              0x10000162E43F50000, 0x100000B1721BD0000, 0x10000058B90CF2000,
              0x1000002C5C863B000, 0x100000162E430E000, 0x1000000B172183000,
              0x100000058B90C1000, 0x10000002C5C860000, 0x1000000162E430000,
              0x10000000B17218000, 0x1000000058B90C000, 0x100000002C5C86000,
              0x10000000162E43000, 0x100000000B1721000, 0x10000000058B91000,
              0x1000000002C5C8000, 0x100000000162E4000, 0x1000000000B172000,
              0x100000000058B9000, 0x10000000002C5D000, 0x1000000000162E000,
              0x10000000000B17000, 0x1000000000058C000, 0x100000000002C6000,
              0x10000000000163000, 0x100000000000B1000, 0x10000000000059000,
              0x1000000000002C000, 0x10000000000016000, 0x1000000000000B000,
              0x10000000000006000, 0x10000000000003000, 0x10000000000001000,
              0x10000000000001000, 0x10000000000000000, 0x10000000000000000,
              0x10000000000000000, 0x10000000000000000, 0x10000000000000000,
              0x10000000000000000, 0x10000000000000000, 0x10000000000000000,
              0x10000000000000000, 0x10000000000000000, 0x10000000000000000,
              0x10000000000000000
          ][index];
    }
}
