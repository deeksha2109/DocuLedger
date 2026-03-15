const { ethers } = require("ethers");

// Load ABI from Hardhat artifacts
const contractJson = require("../../blockchain/artifacts/contracts/DocuLedger.sol/DocuLedger.json");
const abi = contractJson.abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

module.exports = contract;