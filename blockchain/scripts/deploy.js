const hre = require("hardhat");

async function main() {

  console.log("Starting deployment...");

  const DocuLedger = await hre.ethers.getContractFactory("DocuLedger");

  const contract = await DocuLedger.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });