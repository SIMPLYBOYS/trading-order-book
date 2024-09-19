# Real-time Order Book Simulator

## Introduction

This project is a real-time order book simulator for the ETH/BTC trading pair. It fetches live best bid and ask prices from Binance and generates a simulated order book based on these prices. The system provides both RESTful API endpoints and WebSocket connections for real-time updates, making it suitable for applications requiring live market data simulation.

## Features

- Real-time connection to Binance WebSocket for ETH/BTC book ticker
- Simulated order book generation with random prices and sizes
- WebSocket server for real-time updates to clients
- RESTful API endpoint for fetching the current order book
- CORS enabled for cross-origin requests
- Automatic reconnection to Binance WebSocket on disconnection
- Configurable port via environment variables
- Error handling for unhandled rejections and exceptions

## Prerequisites

- Node.js (v12 or later recommended)
- npm (comes with Node.js)
- Git (for cloning the repository)

## Installation

1. Clone the repository:
    git clone <repository-url>
    cd <repository-directory>


2. Install dependencies:
    npm install

3. Create a `.env` file in the root directory and add any necessary environment variables:
    PORT=3000

## Usage

To start the server:
    npm start

The server will start on the port specified in the `.env` file or default to 3000. You should see a console message indicating the server is running and the port it's listening on.

## API Endpoints

- GET `/orderbook`: Fetches the current state of the order book
  - Response format:
    ```json
    {
      "bids": [{"price": "0.12345678", "size": "1.23456789"}, ...],
      "asks": [{"price": "0.12345678", "size": "1.23456789"}, ...],
      "bidSum": "4.99999999",
      "askSum": "149.99999999"
    }
    ```

## WebSocket Events

- `orderBookUpdate`: Emitted whenever the order book is updated with new data
  - Event data format is the same as the `/orderbook` API response

To connect to the WebSocket server from a client:

```javascript
const socket = io('http://localhost:3000');
socket.on('orderBookUpdate', (data) => {
  console.log('Received order book update:', data);
});
```

## Configuration

- Binance WebSocket URL: wss://stream.binance.com:9443/ws/ethbtc@bookTicker
- Bid generation stops when the sum of (price * size) reaches 5
- Ask generation stops when the sum of sizes reaches 150
- Random size generation: Between 0 and 10
- Random price difference: Between 0 and 0.0001

These parameters can be adjusted in the server.js file if different behavior is desired.

## Project Structure
```.
├── server.js           # Main server file
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables (create this file)
└── README.md           # Project documentation