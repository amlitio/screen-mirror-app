# screen-mirror-app

# Screen Mirror App

A secure, open-source web app for encrypted screen mirroring, similar to a simple Join.me alternative. Built with WebRTC for peer-to-peer streaming, ensuring end-to-end encryption. The host creates a session key, shares their screen, and viewers join via the key.

## Features
- Peer-to-peer screen sharing with automatic encryption (DTLS/SRTP via WebRTC).
- Simple session keys for joining.
- No plugins required; works in modern browsers (Chrome, Firefox, Edge).
- Signaling server for initial connections (using Socket.io).

## Prerequisites
- Node.js (v14 or later) installed.
- Modern web browser.

## Local Setup Instructions
1. Clone the repository:
