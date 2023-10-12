const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const TVCharacterNFT = await ethers.getContractFactory("MyNFT");
  const nftContract = await TVCharacterNFT.deploy("MyNFT", "MyNFT", "https://ipfs.io/ipfs/");

  console.log("Contract address:", nftContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
