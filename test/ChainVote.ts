import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("ChainVote", function () {
  let factory: Contract;
  let owner: Signer, voter1: Signer, voter2: Signer, voter3: Signer, stranger: Signer;
  let ownerAddr: string, voter1Addr: string;

  const ONE_DAY = 86400;
  const CID = "bafkreia-test-poll-metadata";

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, stranger] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    voter1Addr = await voter1.getAddress();

    const F = await ethers.getContractFactory("ChainVote");
    factory = await F.deploy();
    await factory.waitForDeployment();
  });

  it("creates a poll with valid inputs", async function () {
    const tx = await factory.createPoll(CID, ["Yes", "No", "Maybe"], ONE_DAY);
    await tx.wait();
    expect(await factory.pollCount()).to.equal(1n);
    const poll = await factory.polls(0);
    expect(poll.creator).to.equal(ownerAddr);
    expect(poll.active).to.be.true;
  });

  it("emits PollCreated event", async function () {
    await expect(factory.createPoll(CID, ["A", "B"], 3600))
      .to.emit(factory, "PollCreated");
  });

  it("rejects fewer than 2 options", async function () {
    await expect(factory.createPoll(CID, ["OnlyOne"], ONE_DAY)).to.be.reverted;
  });

  it("rejects more than 10 options", async function () {
    const tooMany = Array.from({ length: 11 }, (_, i) => `Option ${i}`);
    await expect(factory.createPoll(CID, tooMany, ONE_DAY)).to.be.reverted;
  });

  it("rejects empty CID", async function () {
    await expect(factory.createPoll("", ["A", "B"], ONE_DAY)).to.be.reverted;
  });

  it("records votes correctly", async function () {
    await factory.createPoll(CID, ["Alpha", "Beta"], ONE_DAY);
    await factory.connect(voter1).castVote(0, 1);
    expect(await factory.hasVoted(0, voter1Addr)).to.be.true;
    await factory.connect(voter2).castVote(0, 0);
    const results = await factory.getResults(0);
    expect(results.map(Number)).to.deep.equal([1, 1]);
  });

  it("prevents double voting", async function () {
    await factory.createPoll(CID, ["A", "B"], ONE_DAY);
    await factory.connect(voter1).castVote(0, 0);
    await expect(factory.connect(voter1).castVote(0, 1)).to.be.reverted;
  });

  it("allows creator to close poll", async function () {
    await factory.createPoll(CID, ["A", "B"], ONE_DAY);
    await factory.closePoll(0);
    expect((await factory.polls(0)).active).to.be.false;
  });

  it("rejects non-creator closing", async function () {
    await factory.createPoll(CID, ["A", "B"], ONE_DAY);
    await expect(factory.connect(stranger).closePoll(0)).to.be.reverted;
  });

  it("gas tank funding works", async function () {
    await factory.createPoll(CID, ["A", "B"], ONE_DAY);
    await factory.fundGasTank(0, { value: ethers.parseEther("0.001") });
    expect(await factory.sponsorshipEnabled(0)).to.be.true;
  });
});
