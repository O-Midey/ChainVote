// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainVote
 * @notice On-chain voting with optional gas sponsorship.
 *         Every vote is a transaction. Every result is independently verifiable.
 * @dev Deployed on Base. No admin keys, no upgrade mechanism — fully immutable.
 */
contract ChainVote {
    struct Poll {
        uint256 id;
        address creator;
        string metadataCID;
        string[] options;
        uint256 deadline;
        uint256 createdAt;
        bool active;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voterChoice;
    mapping(address => uint256[]) public creatorPolls;

    // Gas sponsorship
    mapping(uint256 => uint256) public gasTank;
    mapping(uint256 => bool) public sponsorshipEnabled;
    uint256 public constant VOTE_GAS_REFUND = 0.00001 ether;

    event PollCreated(uint256 indexed pollId, address indexed creator, string metadataCID, uint256 deadline, uint256 optionCount);
    event VoteCast(uint256 indexed pollId, address indexed voter, uint256 optionIndex);
    event PollClosed(uint256 indexed pollId, address indexed creator);
    event GasTankFunded(uint256 indexed pollId, address indexed funder, uint256 amount);
    event GasRefunded(uint256 indexed pollId, address indexed voter, uint256 amount);
    event GasTankWithdrawn(uint256 indexed pollId, address indexed creator, uint256 amount);

    modifier pollExists(uint256 pollId) { require(pollId < pollCount, "Poll does not exist"); _; }
    modifier pollActive(uint256 pollId) {
        require(polls[pollId].active, "Poll is closed");
        require(block.timestamp < polls[pollId].deadline, "Poll has ended");
        _;
    }
    modifier onlyCreator(uint256 pollId) { require(polls[pollId].creator == msg.sender, "Not the poll creator"); _; }

    function createPoll(string calldata metadataCID, string[] calldata optionLabels, uint256 durationSec) external returns (uint256 pollId) {
        uint256 len = optionLabels.length;
        require(len >= 2 && len <= 10, "Need 2-10 options");
        require(durationSec >= 60, "Min duration is 60 seconds");
        require(bytes(metadataCID).length > 0, "Metadata CID required");

        pollId = pollCount++;
        polls[pollId] = Poll({ id: pollId, creator: msg.sender, metadataCID: metadataCID, options: optionLabels, deadline: block.timestamp + durationSec, createdAt: block.timestamp, active: true });
        creatorPolls[msg.sender].push(pollId);
        emit PollCreated(pollId, msg.sender, metadataCID, block.timestamp + durationSec, len);
    }

    function castVote(uint256 pollId, uint256 optionIndex) external pollExists(pollId) pollActive(pollId) {
        require(!hasVoted[pollId][msg.sender], "Already voted");
        require(optionIndex < polls[pollId].options.length, "Invalid option");
        hasVoted[pollId][msg.sender] = true;
        voterChoice[pollId][msg.sender] = optionIndex;
        voteCounts[pollId][optionIndex]++;
        _refundGas(pollId, msg.sender);
        emit VoteCast(pollId, msg.sender, optionIndex);
    }

    function closePoll(uint256 pollId) external pollExists(pollId) onlyCreator(pollId) {
        require(polls[pollId].active, "Already closed");
        polls[pollId].active = false;
        emit PollClosed(pollId, msg.sender);
    }

    function fundGasTank(uint256 pollId) external payable pollExists(pollId) {
        require(msg.value > 0, "Must send ETH");
        gasTank[pollId] += msg.value;
        if (!sponsorshipEnabled[pollId]) sponsorshipEnabled[pollId] = true;
        emit GasTankFunded(pollId, msg.sender, msg.value);
    }

    function withdrawGasTank(uint256 pollId) external pollExists(pollId) onlyCreator(pollId) {
        require(block.timestamp >= polls[pollId].deadline, "Poll still active");
        uint256 amount = gasTank[pollId];
        require(amount > 0, "No funds to withdraw");
        gasTank[pollId] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Withdrawal failed");
        emit GasTankWithdrawn(pollId, msg.sender, amount);
    }

    function getResults(uint256 pollId) external view pollExists(pollId) returns (uint256[] memory counts) {
        uint256 len = polls[pollId].options.length;
        counts = new uint256[](len);
        for (uint256 i = 0; i < len; i++) counts[i] = voteCounts[pollId][i];
    }

    function getPollOptions(uint256 pollId) external view pollExists(pollId) returns (string[] memory) { return polls[pollId].options; }
    function getCreatorPolls(address creator) external view returns (uint256[] memory) { return creatorPolls[creator]; }
    function isPollExpired(uint256 pollId) external view pollExists(pollId) returns (bool) { return block.timestamp >= polls[pollId].deadline; }

    function _refundGas(uint256 pollId, address voter) internal {
        if (!sponsorshipEnabled[pollId] || gasTank[pollId] < VOTE_GAS_REFUND) return;
        gasTank[pollId] -= VOTE_GAS_REFUND;
        (bool sent, ) = payable(voter).call{value: VOTE_GAS_REFUND}("");
        if (sent) emit GasRefunded(pollId, voter, VOTE_GAS_REFUND);
        else gasTank[pollId] += VOTE_GAS_REFUND;
    }
}
