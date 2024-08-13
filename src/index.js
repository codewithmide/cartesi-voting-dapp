const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

// Voting DApp state
let proposals = [];
let voters = new Set();
let votingEnd = 0;

function initializeVoting(proposalNames, durationInSeconds) {
  proposals = proposalNames.map(name => ({ name, votes: 0 }));
  votingEnd = Math.floor(Date.now() / 1000) + durationInSeconds;
}

// Initialize with some example proposals and a 1-hour voting period
initializeVoting(["Proposal 1", "Proposal 2", "Proposal 3"], 3600);

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  
  try {
    const payload = JSON.parse(Buffer.from(data.payload.slice(2), "hex").toString());
    console.log("Decoded payload:", payload);
    
    if (payload.method === "vote") {
      const { sender, proposalIndex } = payload;
      
      if (Math.floor(Date.now() / 1000) >= votingEnd) {
        return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Voting has ended" })));
      }
      if (voters.has(sender)) {
        return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Already voted" })));
      }
      if (proposalIndex < 0 || proposalIndex >= proposals.length) {
        return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Invalid proposal index" })));
      }
      
      voters.add(sender);
      proposals[proposalIndex].votes++;
      return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ success: true })));
    }
    
    return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Invalid method" })));
  } catch (error) {
    console.error("Error processing advance:", error);
    return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Internal error" })));
  }
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  
  try {
    const payload = JSON.parse(Buffer.from(data.payload.slice(2), "hex").toString());
    console.log("Decoded inspect payload:", payload);
    
    if (payload.method === "getProposals") {
      return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(proposals)));
    } else if (payload.method === "getRemainingTime") {
      const remaining = Math.max(0, votingEnd - Math.floor(Date.now() / 1000));
      return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ remainingTime: remaining })));
    }
    
    return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Invalid method" })));
  } catch (error) {
    console.error("Error processing inspect:", error);
    return ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ error: "Internal error" })));
  }
}

const handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      const handler = handlers[rollup_req["request_type"]];
      const response = await handler(rollup_req["data"]);
      
      console.log("Sending response:", response);
      
      await fetch(rollup_server + "/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: response }),
      });
    }
  }
})();