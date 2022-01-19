const { expect, assert } = require("chai");
const { saveObj, loadObj, clearObj } = require("./helpers/utils.js");
const BigNumber = require("bignumber.js");
const maxUint128 = "340282366920938463463374607431768211455";

var deployed_contracts = [];
var test;
var signers;
var data = {
    normalized_exponent: [
        { input: "0", expected: "0" },
        { input: "0.00001", expected: "0" },
        { input: "1", expected: "0" },
        { input: "2", expected: "1" },
        { input: "3", expected: "1" },
        { input: "4", expected: "2" },
        { input: "3837467383.39483734", expected: "31" },
        { input: "1000000.293837473", expected: "19" },
        { input: "18446744073709551614.18446744073709551614", expected: "63" },
        { input: "18446744073709551614.18446744073709551614", expected: "63" },
        { input_64x64: "0xFFFFFFFFFFFFFFFF0000000000000000", expected: "63" },
        { input_64x64: "0xFFFFFFFF0000000000000000", expected: "31" },
        { input_64x64: "0xFFFF0000000000000000", expected: "15" },
        { input_64x64: "0xFF0000000000000000", expected: "7" },
        { input_64x64: "0xF0000000000000000", expected: "3" },
        { input_64x64: "0x40000000000000000", expected: "2" },
        { input_64x64: "0x20000000000000000", expected: "1" },
        { input_64x64: maxUint128, expected: "63" }
    ],
    log_base_2_of_fraction:[
        { input: "1.999999999999999999", expected: to64x64RoundDown("0.999999999999999999") },
        { input: "1.18446744073709551615", expected: to64x64RoundDown("0.24423854156444068576") },
        { input: "1", expected: "0" },
        { input: "2", expected: "MustBeLessThanTwo(36893488147419103232)", throwError: true },
        { input: "3.3", expected: "MustBeLessThanTwo(60874255443241520332)", throwError: true }
    ],
    log_base_2: [
        { input: "0", expected: "MustBeGreaterThanOne(0)", throwError: true },
        { input: "0.00001", expected: "MustBeGreaterThanOne(184467440737095)", throwError: true },
        { input: "1.00001", expected: to64x64RoundDown(Math.log2(1.00001)) },
        { input: "2.00001", expected: to64x64RoundDown(Math.log2(2.00001)) },
        { input: "1000000.293837473", expected: to64x64RoundDown(Math.log2("1000000.293837473")) },
        { input: "293837473.293837473", expected: to64x64RoundDown(Math.log2("293837473.293837473")) },
        { input: "18446744073709551615.0", expected: to64x64RoundDown(Math.log2("18446744073709551615.0")) },
        { input_64x64: "340282366920938463463374607431768211455",
          expected: to64x64RoundDown(Math.log2(toActualBy64x64("340282366920938463463374607431768211455")))
        },
        { input_64x64: "340282366920938463463374607431768211456",
          expected: null,
          throwError: true
        }
    ],
    log_base_10: [
        { input: "0", expected: "MustBeGreaterThanOne(0)", throwError: true},
        { input: "1", expected: "0" },
        { input: "2", expected: to64x64RoundDown("0.30102999566398119") },
        { input: "10", expected: to64x64RoundDown("1") },
        { input: "100", expected: to64x64RoundDown("2") },
        { input_64x64: "340282366920938463463374607431768211455", expected: to64x64RoundDown("19.26591972249479649367") }
    ],
    log_base_1_0001: [
        { input: "0", expected: "MustBeGreaterThanOne(0)", throwError: true },
        { input: "1", expected: "0" },
        { input: "1.0001", expected: to64x64RoundDown("1") },
        { input: "2234232342344234.234234234234234", expected: to64x64RoundDown("353444.411798") },
        { input_64x64: "340282366920938463463374607431768211455", expected: to64x64RoundDown("443636.37568") }
    ],
    log_base_0_5: [
        { input: "0", expected: "MustBeGreaterThanZero(0)", throwError: true },
        { input: "1.1", expected: "MustBeLessThanOne(20291418481080506777)", throwError: true },
        { input: "0.1", expected: to64x64RoundDown("3.3219280948873623478703194294893901758648313930245806120547") },
        { input: "0.2", expected: to64x64RoundDown("2.3219280948873623478703194294893901758648313930245806120547") },
        { input: "0.39493837374838367483", expected: to64x64RoundDown("1.3403005424174589836588760673307154315783927125231179797175") },
        { input: "0.999999999999", expected: to64x64RoundDown("0.00000000000144269513") },
        { input: "1", expected: "0" }
    ],
    pow_base_2_of_fraction : [
        { input: "0", expected: "MustBeGreaterThanZero(0)", throwError: true },
        { input: "1", expected: "MustBeLessThanOne(18446744073709551616)", throwError: true },
        { input: "0.5", expected: to64x64RoundDown("1.4142135623730950488016887") },
        { input: "0.000000001", expected: to64x64RoundDown("1.00000000069314709527") },
        { input: "0.900000001", expected: to64x64RoundDown("1.86606598436707320074") },
        { input: "0.999999999999", expected: to64x64RoundDown("1.999999999999999") }
    ],
    pow_base_2 : [
        { input: "0", expected: to64x64RoundDown(Math.pow(2, 0)) },
        { input: "0.1", expected: to64x64RoundDown(Math.pow(2, 0.1)) },
        { input: "1.1", expected: to64x64RoundDown(Math.pow(2, 1.1)) },
        { input: "63", expected: to64x64RoundDown(Math.pow(2, 63)) },
        { input: "63.1", expected: to64x64RoundDown(Math.pow(2, 63.1)) },
        { input: "63.99", expected: to64x64RoundDown(Math.pow(2, 63.99)) },
        { input: "64", expected: "MustBeLessThan64(1180591620717411303424)", throwError: true }
    ],
    pow: [
        { base: "0", exp: "10", expected: to64x64RoundDown(Math.pow(0, 10)) },
        { base: "0.1", exp: "0.1", expected: to64x64RoundDown(Math.pow(0.1, 0.1)) },
        { base: "0.3", exp: "25", expected: to64x64RoundDown(Math.pow(0.3, 25)) },
        { base: "0.1", exp: "16", expected: to64x64RoundDown("9.9999e-17") },
        { base: "0.99", exp: "16", expected: to64x64RoundDown(Math.pow(0.99, 16)) },
        { base: "0.5", exp: "16", expected: to64x64RoundDown(Math.pow(0.5, 16)) },
        { base: "1.1", exp: "10", expected: to64x64RoundDown(Math.pow(1.1, 10)) },
        { base: "2", exp: "4", expected: to64x64RoundDown(Math.pow(2, 4)) },
        { base: "2", exp: "63.99", expected: to64x64RoundDown(Math.pow(2, 63.99)) },
        { base: "2.5", exp: "40", expected: to64x64RoundDown(Math.pow(2.5, 40)) },
        { base: "10.1", exp: "5.6", expected: to64x64RoundDown(Math.pow(10.1, 5.6)) },
        { base: "99.0001", exp: "7.64783", expected: to64x64RoundDown(Math.pow(99.0001, 7.64783)) },
        { base: "100.0001", exp: "0.001", expected: to64x64RoundDown(Math.pow(100.0001, 0.001)) },
        { base: "300.99918473634", exp: "10.94937836745",
          expected: `MustBeLessThan64(1663028846038790935264)`, throwError:true
        }
    ],
    sqrt: [
        { input: "0", expected: "0"},
        { input: "0.0001", expected: to64x64RoundDown("0.01")},
        { input: "0.0000001", expected: to64x64RoundDown("0.000316228")},
        { input: "0.00000000000001", expected: to64x64RoundDown("1e-7")},
        { input: "0.00000000000000001", expected: "58259770936"},
        { input: "0.0000000000000000001", expected: "4294967296"},
        { input: "1.0000000000000000001", expected: to64x64RoundDown("1.0000000000000000001") },
        { input: "4.999999999999", expected: to64x64RoundDown(Math.sqrt("4.999999999999")) },
        { input: "1000000.9999999999999999", expected: to64x64RoundDown(Math.sqrt("1000000.9999999999999999")) },
        { input: "10000000000000.9999999999999999", expected: to64x64RoundDown(Math.sqrt("10000000000000.9999999999999999")) },
        { input: "4503599627370495.99999999999999999995", expected: to64x64RoundDown(Math.sqrt("4503599627370495.99999999999999999995")) }
    ]
}

describe("AxwMathUnsignedFixedPoint64", function () {
    before(async function() {
        await migrate_contracts();
        signers = await getSigners();
        test = await load_contract("Test", signers.deployer);
    });

    describe("#test case set 1", async function () {
          it(`normalized exponent of any number`, async function(){
              const test_data = data.normalized_exponent;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "normalized_exponent");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`log base 2 of a fraction`, async function(){
              const test_data = data.log_base_2_of_fraction;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "log_base_2_of_fraction");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`log base 2 of any number`, async function(){
              const test_data = data.log_base_2;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "log_base_2");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`log base 10 of any number`, async function(){
              const test_data = data.log_base_10;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "log_base_10");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`log base 1.0001 of any number`, async function(){
              const test_data = data.log_base_1_0001;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "log_base_1_0001");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`log base 0.5 of a fraction`, async function(){
              const test_data = data.log_base_0_5;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "log_base_0_5");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`power base 2 of a fraction`, async function(){
              const test_data = data.pow_base_2_of_fraction;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "pow_base_2_of_fraction");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`power base 2 of any number`, async function(){
              const test_data = data.pow_base_2;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "pow_base_2");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`power base any number of any number`, async function(){
              const test_data = data.pow;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeB(test_data[i], "pow");
                  console.log("       ---------------------------------------------");
              }
          })
          it(`square root of any number`, async function(){
              const test_data = data.sqrt;
              for(var i = 0; i < test_data.length; i++) {
                  await function_typeA(test_data[i], "sqrt");
                  console.log("       ---------------------------------------------");
              }
          })
    })
})

async function migrate_contracts() {
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy();

    deployed_contracts.push({
        name: "Test",
        address: test.address,
        artifact: "Test.sol",
        contract: "Test",
    });
    await saveObj("deployed_contracts", deployed_contracts);
    console.log("       >Info: contract deployed at ", test.address);
}

async function load_contract(name, signer) {
    deployed_contracts = await loadObj("deployed_contracts");
    const signers = await getSigners();
    return await ethers.getContractAt("Test", deployed_contracts[0].address, signer);
}

async function getSigners() {
    const _signers = await ethers.getSigners();

    return {
        deployer : _signers[0]
    }
}

async function function_typeA(raw, function_name) {
    var x, x_64x64;
    if(raw.input) {
        x = raw.input;
        x_64x64 = to64x64RoundDown(x);
    }
    if(raw.input_64x64) {
        x_64x64 = raw.input_64x64;
        x = toActualBy64x64(x_64x64);
    }

    console.log(`       > Info: ${function_name}`);
    console.log(`       > RawData: ${JSON.stringify(raw)}`);
    console.log(`       > Param x: ${x}`);
    console.log(`       > Param x_64x64: ${x_64x64}`);

    const function_promise = test[function_name](x_64x64);

    if(raw.throwError){
        if(raw.expected){
            await expect(function_promise).to.be.revertedWith(raw.expected);
        }else {
            await expect(function_promise).to.be.reverted;
        }
        console.log(`       > Success: an error was thrown - ${raw.expected}` );
    }else {
        const gasEstimate = await test.estimateGas[function_name](x_64x64);
        var actual = (await function_promise).toString();

        if(Math.abs(actual - raw.expected) / raw.expected < 0.001) {
            console.log(`       > Success: actual is ${actual}; expected is ${raw.expected}` );
        }else {
            const gasEstimate = await test.estimateGas[function_name](x_64x64);
            await expect(parseFloat(actual)).to.be.equals(parseFloat(raw.expected)); //this will give an error
            console.log(`       > Success: actual is ${actual}; expected is ${raw.expected}` );
        }
        console.log(`       > Gas Estimate: ${gasEstimate}` );
    }
}

async function function_typeB(raw, function_name) {
    var base, exp, base_64x64, exp_64x64, expected
    if(raw.base) {
        base = raw.base;
        base_64x64 = to64x64RoundDown(base);
    }
    if(raw.exp) {
        exp = raw.exp;
        exp_64x64 = to64x64RoundDown(exp);
    }
    if(raw.base_64x64) {
        base_64x64 = raw.base_64x64;
        base = toActualBy64x64(base_64x64);
    }
    if(raw.exp_64x64) {
        exp_64x64 = raw.exp_64x64;
        exp = toActualBy64x64(exp_64x64);
    }

    console.log(`       > Info: ${function_name}`);
    console.log(`       > Data: ${JSON.stringify(raw)}`);
    console.log(`       > Param base_64x64: ${base_64x64}`);
    console.log(`       > Param exp_64x64: ${exp_64x64}`);

    const function_promise = test[function_name](base_64x64, exp_64x64);

    if(raw.throwError){
        if(raw.expected){
            await expect(function_promise).to.be.revertedWith(raw.expected);
        }else {
            await expect(function_promise).to.be.reverted;
        }
        console.log(`       > Success: an error was thrown - ${raw.expected}` );
    }else {
        const gasEstimate = await test.estimateGas[function_name](base_64x64, exp_64x64);
        var actual = (await function_promise).toString();
        if(Math.abs(actual - raw.expected) / raw.expected < 0.001) {
            console.log(`       > Success: actual is ${actual}; expected is ${raw.expected}` );
        } else {
            const gasEstimate = await test.estimateGas[function_name](base_64x64, exp_64x64);
            await expect(parseFloat(actual)).to.be.equals(parseFloat(raw.expected));
            console.log(`       > Success: actual is ${actual}; expected is ${raw.expected}` );
        }
        console.log(`       > Gas Estimate: ${gasEstimate}` );
    }
}

function to64x64RoundDown(x) {
    BigNumber.set({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_DOWN });

    const scale = (new BigNumber(2)).pow(64);
    const result = (new BigNumber(x)).multipliedBy(scale); //2**64
    return result.toFixed(0);
}

function toActualBy64x64(x) {
    BigNumber.set({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_DOWN });
    x = new BigNumber(x);
    const scale = (new BigNumber(2)).pow(64);
    const result = x.dividedBy(scale); //2**64
    return result.toFixed(20);
}
