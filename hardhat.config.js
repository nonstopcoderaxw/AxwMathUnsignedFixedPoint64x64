require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require('solidity-coverage');
require("hardhat-gas-reporter");



module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: `./contracts`,
    tests: `./test`,
    cache: `./cache`,
    artifacts: `./artifacts`
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 150,
    enabled: false
  }
}
