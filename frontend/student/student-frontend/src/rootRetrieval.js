
import { ethers } from "ethers";

// Replace with your contract's address and ABI
const contractAddress = "0xE8eba6Ff334b8aDF50c5b635ef6653b884E0e01b";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "school",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "semester",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "RootAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "school",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "semester",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32"
			}
		],
		"name": "addRoot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "school",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "semester",
				"type": "string"
			}
		],
		"name": "getRoot",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "school",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "semester",
				"type": "string"
			}
		],
		"name": "getRootInfo",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Helper to get contract instance
async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum); // v6.x
  const signer = await provider.getSigner(); // note: await!
  return new ethers.Contract(contractAddress, contractABI, signer);
}

// Retrieve the current review root from the contract
export async function getReviewRoot() {
  const contract = await getContract();
  
  return await contract.getRoot("Boston University", "Spring 2025"); // this is hard coded for now
}
