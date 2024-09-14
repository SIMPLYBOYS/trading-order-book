const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Binance API endpoint for fetching the best bid and ask prices
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/bookTicker';

// Correct trading pair symbol
const TRADING_PAIR = 'ETHBTC';

// Function to generate random order size
function generateRandomSize() {
    return Math.random() * 10; // Random size between 0 and 10
}

// Function to generate random price difference
function generateRandomPriceDiff() {
    return Math.random() * 0.0001; // Small random price difference
}

// Function to generate order book
function generateOrderBook(bestBid, bestAsk, depth = 10) {
    let bids = [];
    let asks = [];

    let currentBidPrice = parseFloat(bestBid);
    let currentAskPrice = parseFloat(bestAsk);

    for (let i = 0; i < depth; i++) {
        // Generate bid
        bids.push({
            price: currentBidPrice.toFixed(8),
            size: generateRandomSize().toFixed(8)
        });
        currentBidPrice -= generateRandomPriceDiff();

        // Generate ask
        asks.push({
            price: currentAskPrice.toFixed(8),
            size: generateRandomSize().toFixed(8)
        });
        currentAskPrice += generateRandomPriceDiff();
    }

    return { bids, asks };
}

// API endpoint to get the order book
app.get('/orderbook', async (req, res) => {
    try {
        // Fetch best bid and ask prices from Binance API
        const response = await axios.get(BINANCE_API_URL, {
            params: { symbol: TRADING_PAIR },
            timeout: 5000 // 5 seconds timeout
        });

        console.log('Binance API response:', response.data);

        const { bidPrice, askPrice } = response.data;

        if (!bidPrice || !askPrice) {
            throw new Error('Invalid data received from Binance API');
        }

        // Generate order book based on fetched prices
        const orderBook = generateOrderBook(bidPrice, askPrice);

        res.json(orderBook);
    } catch (error) {
        console.error('Error fetching data from Binance:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        res.status(500).json({ 
            error: 'Failed to fetch order book data', 
            details: error.message,
            binanceError: error.response ? error.response.data : null
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Order book server running on port ${port}`);
    console.log(`Fetching order book data for ${TRADING_PAIR}`);
});