// Vercel serverless function entry point
// This file exports your Express app for Vercel's serverless functions

// server/api/index.js

const { createServer } = require('@vercel/node');
const app = require('../dist/server.js').default;

module.exports = createServer(app);
