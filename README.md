<h1 align="center">Sabot ✅</h1>
<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
<a href="https://github.com/gian-gg/sabot/blob/main/LICENSE">
<img alt="License" src="https://img.shields.io/badge/License-MIT-002D72?style=for-the-badge" />
</a>

<!-- PROJECT LOGO -->
<div align="center">
  <br />
  <a href="https://github.com/gian-gg/sabot">
    <img src="public/logo-white.svg" alt="Sabot logo" width="40%" height="35%">
  </a>
  <br />
  <p align="center">
    <br />
    <p align="center">
      <a href="#"><img alt="Status" src="https://img.shields.io/badge/status-Beta-yellow?style=flat&color=yellow" /></a>
      <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15.5.4-2B2B2B?logo=nextdotjs&logoColor=white&style=flat" /></a>
      <a href="https://github.com/gian-gg/sabot/commits/main"><img alt="Last commit" src="https://proxy.cyb3rko.de/shields/github/last-commit/gian-gg/sabot?color=coral&logo=git&logoColor=white" /></a>
    </p>
    <a href="https://github.com/gian-gg/sabot/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/gian-gg/sabot/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#%EF%B8%8F-project-overview">🗺️ Project Overview</a>
      <ul>
        <li><a href="#-built-with">📚 Built With</a></li>
      </ul>
    </li>
    <li><a href="#-screenshots--features">📱 Screenshots</a></li>
    <li>
      <a href="#-getting-started">💻 Getting Started</a>
      <ul>
        <li><a href="#-prerequisites">🔧 Prerequisites</a></li>
        <li><a href="#%EF%B8%8F-installation">🛠️ Installation</a></li>
        <li><a href="#%EF%B8%8F-running-the-application">▶️ Running</a></li>
      </ul>
    </li>
    <li><a href="#-notes">📝 Notes</a></li>
    <li><a href="#-contributing">📬 Contributing</a></li>
    <li><a href="#%EF%B8%8F-license">⚖️ License</a></li>
  </ol>
</details>

<!-- PROJECT OVERVIEW -->

## 🗺️ Project Overview

A composable platform designed for **peer-to-peer transaction verification**, offering clear transaction lifecycles, invite-and-accept flows, and structured UI primitives that make it easy to extend or re-implement. Acting as a **third-party safety layer**, Sabot ensures verified, transparent, and scam-free online transactions.

### ⭐ Features

**🔗 Blockchain Escrow Integration**: Comprehensive smart contract integration for secure fund management  
**🔮 Oracle Verification System**: Decentralized dispute resolution with oracle-based verification  
**⚖️ Arbiter Management**: Democratic arbiter selection and dispute resolution workflows  
**📊 Real-time Status Tracking**: Live updates for escrow status and deliverable tracking  
**🛡️ Enhanced Security**: Multi-layer security with access controls and reentrancy protection

### 📚 Built With

<p align="left">
  <!-- Vercel -->
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Vercel-232323?logo=vercel&logoColor=white&style=flat" /></a>
  <!-- Next.js -->
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-2B2B2B?logo=nextdotjs&logoColor=white&style=flat" /></a>
  <!-- TypeScript -->
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat" /></a>
  <!-- Ethereum -->
  <a href="https://ethereum.org/"><img alt="Ethereum" src="https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white&style=flat" /></a>
  <!-- Lisk -->
  <a href="https://lisk.com/"><img alt="Lisk" src="https://img.shields.io/badge/Lisk-0055FF?logo=lisk&logoColor=white&style=flat" /></a>
  <!-- ShadCN/UI -->
  <a href="https://ui.shadcn.com/"><img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn/ui-111111?logo=shadcnui&logoColor=white&style=flat" /></a>
  <!-- Tailwind CSS -->
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-0EA5E9?logo=tailwindcss&logoColor=white&style=flat" /></a>
  <!-- Lucide Icons -->
  <a href="https://lucide.dev/"><img alt="Lucide Icons" src="https://img.shields.io/badge/Lucide_Icons-18181B?logo=lucide&logoColor=white&style=flat" /></a>
  <!-- Google Gemini -->
  <a href="https://gemini.google.com/"><img alt="Google Gemini" src="https://img.shields.io/badge/Google_Gemini-4285F4?logo=googlegemini&logoColor=white&style=flat" /></a>
</p>

<!-- GETTING STARTED -->

## 💻 Getting Started

Follow these steps to get Sabot running on your local machine.

### 🔧 Prerequisites

- Node.js (version 16.0 or higher)
- Bun
- Metamask

### 🛠️ Installation

#### 1. Clone the Repository

```sh
git clone https://github.com/gian-gg/sabot.git
cd sabot
```

#### 2. Install Dependencies with Bun

```sh
# Install project dependencies
bun install
```

#### 3. Environment Setup

```bash
# Copy the environment template
cp .env.example .env
```

Edit the `.env` file with your configuration (API keys, database URL, etc.)

#### 4. Database Setup

Apply database migrations:

```sh
# Run Supabase migrations
npx supabase db push
```

#### 5. Blockchain Setup (Optional)

For full escrow functionality, set up the smart contract:

```sh
# Navigate to blockchain directory
cd ../SabotBlockchain/transaction-smart-contract

# Install dependencies
npm install

# Deploy contracts (local development)
npx hardhat run scripts/deploy-local.ts --network localhost
```

### ▶️ Running the Application

```sh
bun run dev
```

## 📝 Notes

### 🔗 Blockchain Integration

Sabot now includes comprehensive blockchain integration for secure escrow management:

- **Smart Contract**: Deployed AgreementLedger contract with advanced escrow functionality
- **Oracle System**: Decentralized verification for dispute resolution
- **Token Economics**: ERC-20 token integration with fee distribution
- **Security**: Multi-layer security with access controls and reentrancy protection

### 📚 Documentation

All project documentation is available in the [docs](docs) directory. This includes:

- **[Introduction](docs/01-introduction)**: Documnetation related to getting started.
- **[Architecture](docs/02-architecture)**: Documentation related to the application's architecture and design.
- **[Developer Guide](docs/03-developer-guide)**: Comprehensive guides for developers, covering setup, architecture, and contribution guidelines.
- **[User Guide](docs/04-user-guide)**: Detailed information for end-users on how to use the application.

### 🧪 Testing

The platform includes comprehensive testing for both frontend and smart contract functionality:

```sh
# Frontend tests
bun test

# Smart contract tests
cd ../SabotBlockchain/transaction-smart-contract
npx hardhat test
```

## 💱 Transaction Smart Contract

The smart contract code for this project is hosted in its own repository: [transaction-smart-contract](https://github.com/eliseoalcaraz/transaction-smart-contract).

This project provides a token-based (SBT) system for creating immutable agreements and managing multi-deliverable escrow.

**Key Technologies:**

- **Blockchain:** Lisk Sepolia Testnet
- **Smart Contract Language:** Solidity
- **Development Framework:** Hardhat
- **Programming Language (for project configuration/scripts):** TypeScript

**Key Features:**

1.  **Token & Agreement System:**
    - **SBT Utility Token:** An ERC20-like token built directly into the contract.
    - **User Registration:** `registerUser()` grants new users 100 SBT.
    - **Agreement Creation:** `createAgreement()` allows two registered users to create an immutable, timestamped agreement.
    - **Fee Mechanism:** 10 SBT from each party (total 20 SBT) for agreement creation. 80% (16 SBT) goes to `devWallet`, 20% (4 SBT) is burned.
    - **Reporting System:** `reportIssue()` allows parties to create on-chain reports for disputes.
    - **Admin Controls:** `Ownable` contract (OpenZeppelin) allows owner to update `devWallet`.

2.  **Escrow System:**
    - **Multiple Deliverable Types:** Supports Crypto (ETH), BankTransfer, FileDeliverable, PhysicalItem, Service, and Hybrid escrows.
    - **ETH Locking:** Securely locks ETH for crypto-based escrows.
    - **Hash-Based Verification:** Uses cryptographic hashes for non-crypto deliverables.
    - **Dual Confirmation:** Both parties must confirm completion for fund release.
    - **Proof Submission:** Parties can submit proof of delivery/completion.
    - **Mutual Arbiter Selection:** Disputes require both parties to approve an arbiter.
    - **Arbiter Resolution:** Arbiters can resolve disputes (release, refund, split).
    - **Fee Structure:** 2% platform fee on successful completion, 1% arbiter fee for dispute resolution.
    - **Expiration Handling:** Automatic refund to initiator if escrow expires.
    - **Cancellation:** Initiators can cancel pending escrows.
    - **Security:** `ReentrancyGuard` protection.

3.  **Oracle Verification System:**
    - **Purpose:** Automatic verification for `FileDeliverable` and `Service` escrows.
    - **Authorization:** `authorizeOracle()` (owner-only) manages oracle addresses.
    - **Submission:** `submitOracleVerification()` allows authorized oracles to submit verification results, auto-confirming for the submitting party if verified.
    - **Advisory Role:** Assists confirmation but doesn't control release; arbiter decisions always supersede.

<!-- CONTRIBUTING -->

## 📬 Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📢 Contributors

<a href="https://github.com/gian-gg/sabot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=gian-gg/sabot" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/gian-gg/sabot.svg?style=for-the-badge
[contributors-url]: https://github.com/gian-gg/sabot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/gian-gg/sabot.svg?style=for-the-badge
[forks-url]: https://github.com/gian-gg/sabot/network/members
[stars-shield]: https://img.shields.io/github/stars/gian-gg/sabot.svg?style=for-the-badge
[stars-url]: https://github.com/gian-gg/sabot/stargazers
[issues-shield]: https://img.shields.io/github/issues/gian-gg/sabot.svg?style=for-the-badge
[issues-url]: https://github.com/gian-gg/sabot/issues
