// src/services/vector.service.js

const { Pinecone } = require('@pinecone-database/pinecone');

// Add a check to ensure the Pinecone API key is loaded
const pineconeApiKey = process.env.PINECONE_API_KEY;
if (!pineconeApiKey) {
    throw new Error("FATAL ERROR: PINECONE_API_KEY is not defined in your .env file.");
}

// Initialize Pinecone client
const pc = new Pinecone({ apiKey: pineconeApiKey });
const cohortChatGptIndex = pc.Index('chatgpt');

/**
 * Upserts a vector into the Pinecone index.
 * @param {object} params - The parameters for creating memory.
 * @param {number[]} params.vectors - The vector embedding.
 * @param {object} params.metadata - The metadata to store with the vector.
 * @param {string} params.messageId - The unique ID for the vector.
 */
async function createMemory({ vectors, metadata, messageId }) {
    await cohortChatGptIndex.upsert([{
        id: messageId.toString(), // Ensure ID is a string
        values: vectors,
        metadata
    }]);
}

/**
 * Queries the Pinecone index for similar vectors.
 * @param {object} params - The parameters for querying memory.
 * @param {number[]} params.queryVector - The vector to search with.
 * @param {number} [params.limit=5] - The number of results to return.
 * @param {object} params.metadata - The metadata filter to apply.
 * @returns {Promise<Array>} - A promise that resolves to an array of matches.
 */
async function queryMemory({ queryVector, limit = 5, metadata }) {
    const data = await cohortChatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    });

    return data && data.matches ? data.matches : [];
}

// --- THIS IS THE FIX ---
// Only export the functions defined in this file.
module.exports = { 
    createMemory, 
    queryMemory 
};