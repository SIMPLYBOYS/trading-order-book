require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// WebSocket URL for Binance ETH/BTC book ticker
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/ethbtc@bookTicker';

// Initialize order book structure
let orderBook = { bids: [], asks: [], bidSum: '0', askSum: '0' };

// Generate a random size for an order
function generateRandomSize() {
    return Math.random() * 10;
}

// Generate a random price difference
function generateRandomPriceDiff() {
    return Math.random() * 0.0001;
}

// Generate a simulated order book based on best bid and ask prices
function generateOrderBook(bestBid, bestAsk) {
    let bids = [];
    let asks = [];

    let currentBidPrice = parseFloat(bestBid);
    let currentAskPrice = parseFloat(bestAsk);
    let bidSum = 0;
    let askSum = 0;

    // Generate bid orders
    while (bidSum < 5) {
        const size = generateRandomSize();
        const total = currentBidPrice * size;
        if (bidSum + total > 5) break;
        bids.push({
            price: currentBidPrice.toFixed(8),
            size: size.toFixed(8)
        });
        bidSum += total;
        currentBidPrice -= generateRandomPriceDiff();
    }

    // Generate ask orders
    while (askSum < 150) {
        const size = generateRandomSize();
        if (askSum + size > 150) break;
        asks.push({
            price: currentAskPrice.toFixed(8),
            size: size.toFixed(8)
        });
        askSum += size;
        currentAskPrice += generateRandomPriceDiff();
    }

    return { bids, asks, bidSum: bidSum.toFixed(8), askSum: askSum.toFixed(8) };
}

// Connect to Binance WebSocket and handle incoming data
function connectToBinance() {
    const ws = new WebSocket(BINANCE_WS_URL);

    ws.on('open', () => {
        console.log('Connected to Binance WebSocket');
    });

    ws.on('message', (data) => {
        try {
            const { b: bidPrice, a: askPrice } = JSON.parse(data);
            orderBook = generateOrderBook(bidPrice, askPrice);
            io.emit('orderBookUpdate', orderBook);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    return ws;
}

// Initialize WebSocket connection
let binanceWs = connectToBinance();

// Handle WebSocket closure and attempt reconnection
binanceWs.on('close', (code, reason) => {
    console.log(`Binance WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(connectToBinance, 5000);
});

// Handle new Socket.IO client connections
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.emit('orderBookUpdate', orderBook);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// API endpoint to get current order book
app.get('/orderbook', (req, res) => {
    res.json(orderBook);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 3000;
// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});