// src/services/token.service.js
const jwt = require('jsonwebtoken');

class TokenService {
  // Generate JWT token
  generateToken(walletAddress, expiresIn = process.env.JWT_EXPIRE || '7d') {
    return jwt.sign(
      { walletAddress },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Decode token without verification
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Generate refresh token (longer expiry)
  generateRefreshToken(walletAddress) {
    return jwt.sign(
      { walletAddress, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
  }
}

module.exports = new TokenService();