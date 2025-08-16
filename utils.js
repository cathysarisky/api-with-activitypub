require('dotenv').config();
const jwt = require('jsonwebtoken');

const GHOST_ADMIN_API_URL = process.env.GHOST_ADMIN_API_URL;
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

function generateGhostToken() {
    if (!GHOST_ADMIN_API_KEY) {
        throw new Error('GHOST_ADMIN_API_KEY environment variable is required');
    }
    
    // Split the API key into id and secret
    const [id, secret] = GHOST_ADMIN_API_KEY.split(':');
    
    if (!id || !secret) {
        throw new Error('GHOST_ADMIN_API_KEY must be in format "id:secret"');
    }
    
    // Create the token
    return jwt.sign({}, Buffer.from(secret, 'hex'), {
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: '/admin/'
    });
}

module.exports = {
    generateGhostToken,
    GHOST_ADMIN_API_URL
};