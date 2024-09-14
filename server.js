// Import required modules
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Define constants for Binance API URL and trading pair
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/bookTicker';
const TRADING_PAIR = 'ETHBTC';

// Initialize order book object
let orderBook = { bids: [], asks: [] };

// Generate a random size for order book entries
function generateRandomSize() {
    return Math.random() * 10;
}

// Generate a random price difference for order book entries
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

// Fetch current best bid and ask prices from Binance API and update the order book
async function updateOrderBook() {
    try {
        const response = await axios.get(BINANCE_API_URL, {
            params: { symbol: TRADING_PAIR },
            timeout: 5000
        });

        const { bidPrice, askPrice } = response.data;
        orderBook = generateOrderBook(bidPrice, askPrice);
        console.log('Order book updated:', new Date().toISOString());
    } catch (error) {
        console.error('Error updating order book:', error.message);
    }
}

// Update order book every 30 seconds
setInterval(updateOrderBook, 30000);

// Initial update
updateOrderBook();

// Define route to get the current order book
app.get('/orderbook', (req, res) => {
    res.json(orderBook);
});

// Start the server
app.listen(port, () => {
    console.log(`Order book server running on port ${port}`);
    console.log(`Fetching order book data for ${TRADING_PAIR}`);
});