// src/rootRetrieval.js
import { ethers } from "ethers";

// Replace with your contract's address and ABI
const contractAddress = "";
const contractABI = [
  // ... your contract ABI here ...
];

// Helper to get contract instance
async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

// Retrieve the current review root from the contract
export async function getReviewRoot() {
  const contract = await getContract();
  return await contract.reviewRoot(); // Replace with your getter function name
}
