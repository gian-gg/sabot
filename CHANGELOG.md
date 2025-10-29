# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## Unreleased

### Added

- Scroll-to-top behavior when navigating steps in the transaction creation flow.

### Changed

- Deliverable status derivation now requires an existing proof before auto-confirmation via oracle verification.
- UI progress treats `confirmed` deliverables as complete (100%).

### Fixed

- Mirror `item_confirmed` and `payment_confirmed` across both participants for all deliverable types, including `mixed`.
- Manual and oracle confirmation paths persist mirrored confirmations for both participants.
