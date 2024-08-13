# Cartesi Voting DApp

This project is a decentralized voting application (DApp) built on the Cartesi platform. It allows users to cast votes for different proposals and view the voting results.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Building the DApp](#building-the-dapp)
5. [Running the DApp](#running-the-dapp)
6. [Interacting with the DApp](#interacting-with-the-dapp)
7. [Understanding the Code](#understanding-the-code)
8. [Troubleshooting](#troubleshooting)

## Project Structure

```bash
.
├── .cartesi/
├── src/
│   ├── hex_converter.js
│   └── index.js
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package-lock.json
├── package.json
├── README.md
└── yarn.lock
```

- `src/`: Contains the main application code
  - `hex_converter.js`: Utility for converting JSON strings to hex format
  - `index.js`: Main DApp logic
- `Dockerfile`: Defines the Docker image for the DApp
- `package.json` & `package-lock.json`: Node.js package configuration
- `.cartesi/`: Cartesi-specific configuration files

## Prerequisites

- Node.js (v14 or later)
- Yarn package manager
- Docker
- Cartesi Rollups environment

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/codewithmide/cartesi-voting-dapp
   cd cartesi-voting-dapp
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Ensure you have the Cartesi Rollups environment set up. Follow the official Cartesi documentation for detailed instructions.

## Building the DApp

To build the DApp, run:

```bash
cartesi build
```

This command uses the Dockerfile to create a Docker image of your DApp.

## Running the DApp

To run the DApp, use:

```bash
cartesi run
```

This command starts the Cartesi node and your DApp.

## Interacting with the DApp

You can interact with the DApp using the Cartesi CLI. The DApp accepts inputs in both string and hex formats.

### Casting a vote

1. Prepare the hex-encoded input:
   - Open the `src/hex_converter.js` file in a text editor.
   - Locate the `jsonString` variable and replace its value with your vote JSON. For example:

     ```javascript
     const input = '{"method":"vote","sender":"0x1234567890123456789012345678901234567890","proposalIndex":0}';
     ```

   - Save the file.

2. Generate the hex-encoded input:

   ```bash
   node src/hex_converter.js
   ```

   The script will output the hex-encoded version of your input.

3. Send the vote:

   ```bash
   cartesi send generic
   ```

   When prompted:
   - Choose "Foundry" for the chain
   - Enter `http://127.0.0.1:8545` as the RPC URL
   - Choose "Mnemonic" for the wallet
   - Enter the mnemonic (for testing, use: `test test test test test test test test test test test junk`)
   - Select the displayed account
   - Enter the application address (e.g., `0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e`)
   - Choose "Hex string encoding" for the input method
   - Paste the hex-encoded input generated in step 2

**Alternatively, you can use "String encoding" and input the JSON directly if preferred.**

### Querying the DApp state

To check the results of the voting or the current state of the DApp:

1. Open `http://localhost:8080/graphql` in your web browser.
2. Use the following GraphQL query to get the latest reports:

```graphql
query {
  reports(last: 10) {
    edges {
      node {
        index
        payload
      }
    }
  }
}
```

This query will return the last 10 reports, which should include the results of recent votes. The payloads will be in hex format, so you'll need to decode them to see the actual content.

## Understanding the Code

- `src/index.js`: Contains the main logic for the voting DApp, handling vote processing, report generation, and interaction with the Cartesi Rollups server.
- `src/hex_converter.js`: Provides a utility function for converting a JSON string to hex format, crucial for preparing inputs for the DApp.

The DApp uses simple in-memory storage for votes and proposals. In a production environment, you'd want to use a more robust storage solution.

## Troubleshooting

- Ensure all prerequisites are correctly installed and you're using the latest version of the Cartesi Rollups environment.
- Check the Cartesi logs for detailed error messages:

  ```bash
  cartesi logs
  ```

- For input issues, verify that your JSON in `hex_converter.js` is correctly formatted.
- If using hex input, ensure the hex string is properly formatted and includes the '0x' prefix.
- If you encounter issues with the hex conversion, check that you've saved the changes to `hex_converter.js` before running it.

For more detailed information and advanced usage, please refer to the official Cartesi documentation.
