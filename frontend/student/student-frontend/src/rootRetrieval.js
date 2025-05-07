import { ethers } from "ethers";

const contractAddress = "0x63f19271B12d9A914ff9ae3239f4A7275568dab3";
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

// Retrieve the current review root from the contract for given school and semester
export async function getReviewRoot(school, semester) {
  const contract = await getContract();
  return await contract.getRoot(school, semester);
}
