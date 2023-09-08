// scripts/01_deploy_nft_marketplace.js
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying NFTMarketplace with the account: ${deployer.address}`);

  const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
  const nftMarketplace = await NFTMarketplace.deploy();

  console.log(`NFTMarketplace address: ${nftMarketplace.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
