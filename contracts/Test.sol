// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AxwMathUnsignedFixedPoint64x64.sol";

contract Test {
    using AxwMathUnsignedFixedPoint64x64 for uint128;

    function normalized_exponent(uint128 x_64x64) public pure returns (uint8 exponent) {
        return x_64x64.normalized_exponent();
    }

    function log_base_2_of_fraction(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.log_base_2_of_fraction();
    }

    function log_base_2(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.log_base_2();
    }

    function log_base_1_0001(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.log_base_1_0001();
    }

    function log_base_10(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.log_base_10();
    }

    function log_base_0_5(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.log_base_0_5();
    }

    function pow_base_2_of_fraction(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.pow_base_2_of_fraction();
    }

    function pow_base_2(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.pow_base_2();
    }

    function pow(
        uint128 base_64x64,
        uint128 exp_64x64
    ) public pure returns (uint128 result_64x64) {
        return base_64x64.pow(exp_64x64);
    }

    function sqrt(uint128 x_64x64) public pure returns (uint128 result_64x64) {
        return x_64x64.sqrt();
    }
}
