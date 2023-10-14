/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require('@nomiclabs/hardhat-waffle')

const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
   solidity: "0.8.0",
   defaultNetwork: "sepolia", // Set "sepolia" as the default network
   networks: {
      hardhat: {},
      goerli: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      },
      sepolia: {
         url: API_URL, // Replace with your "sepolia" RPC URL
         accounts: [`0x${PRIVATE_KEY}`] // Use your "sepolia" private key
         // Add any other configuration options specific to the "sepolia" network
      }
   },
}
