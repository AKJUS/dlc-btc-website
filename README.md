# iBTC Bridge dApp

## Overview

**iBTC Website** is an interface for interacting with DLC.Link smart contracts and the Bitcoin blockchain. This platform provides a secure and efficient self-custodial way to lock Bitcoin as collateral and mint iBTC tokens based on the amount of Bitcoin locked.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables using the template (see Environment Setup below)

### Environment Setup

The project includes an `.env.template` file that serves as a template for all required environment variables. To set up your environment:

1. Copy `.env.template` for each environment you need:

   - `.env.localhost` for local development
   - `.env.devnet` for devnet environment
   - `.env.testnet` for testnet environment
   - `.env.mainnet` for production environment

2. Fill in the required values in each environment file according to the comments in the template

Note: Never commit actual `.env` files to version control.

### Available Commands

```bash
yarn localhost  # Start development server with localhost config
yarn devnet    # Start development server with devnet config
yarn testnet   # Start development server with testnet config
yarn mainnet   # Start development server with mainnet config
yarn build     # Build the production application
```

### Local Development with Netlify

To run the application locally with Netlify functions and environment variables:

1. Login to Netlify CLI:

   ```bash
   netlify login
   ```

2. Link your project to a Netlify site:

   ```bash
   netlify link
   ```

3. Start local development with Netlify functions enabled:
   ```bash
   netlify dev
   ```

This will start the development server with access to Netlify functions and environment variables.
