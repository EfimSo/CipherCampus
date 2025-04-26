// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SchoolRootRegistry
/// @notice Stores and publishes Merkle roots per school & semester
contract SchoolRootRegistry {
    /// @dev Owner who is allowed to add roots
    address public owner;

    /// @dev Information about a stored root
    struct RootInfo {
        bytes32 root;
        uint256 timestamp;
    }

    /// @dev Mapping: school name ⇒ semester name ⇒ RootInfo
    mapping(string => mapping(string => RootInfo)) private roots;

    /// @notice Emitted when a new root is added
    /// @param school    The school identifier
    /// @param semester  The semester identifier
    /// @param root      The Merkle root
    /// @param timestamp When it was added
    event RootAdded(
        string indexed school,
        string indexed semester,
        bytes32 root,
        uint256 timestamp
    );

    /// @dev Restricts calls to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "SchoolRootRegistry: caller is not owner");
        _;
    }

    /// @notice Set deployer as owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Transfer ownership to a new address
    /// @param newOwner The address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SchoolRootRegistry: new owner is zero address");
        owner = newOwner;
    }

    /// @notice Add or update a Merkle root for a given school & semester
    /// @param school   The school identifier (e.g. "CAS")
    /// @param semester The semester identifier (e.g. "Fall2025")
    /// @param root     The Merkle root to store
    function addRoot(
        string calldata school,
        string calldata semester,
        bytes32 root
    ) external onlyOwner {
        roots[school][semester] = RootInfo({
            root: root,
            timestamp: block.timestamp
        });
        emit RootAdded(school, semester, root, block.timestamp);
    }

    /// @notice Retrieve the Merkle root for a school & semester
    /// @param school   The school identifier
    /// @param semester The semester identifier
    /// @return root     The stored Merkle root (zero if unset)
    function getRoot(
        string calldata school,
        string calldata semester
    ) external view returns (bytes32 root) {
        return roots[school][semester].root;
    }

    /// @notice Retrieve the root and the time it was added
    /// @param school   The school identifier
    /// @param semester The semester identifier
    /// @return root      The stored Merkle root
    /// @return timestamp When the root was added (block timestamp)
    function getRootInfo(
        string calldata school,
        string calldata semester
    ) external view returns (bytes32 root, uint256 timestamp) {
        RootInfo storage info = roots[school][semester];
        return (info.root, info.timestamp);
    }
}
