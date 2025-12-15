// src/middleware/validateWallet.js
const { PublicKey } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const validateWalletSignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate required fields
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address, signature, and message are required'
      });
    }

    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Solana wallet address'
      });
    }

    // Decode signature and message
    let signatureDecoded, messageDecoded, publicKeyDecoded;
    
    try {
      signatureDecoded = bs58.decode(signature);
      messageDecoded = new TextEncoder().encode(message);
      publicKeyDecoded = bs58.decode(walletAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decode signature or message'
      });
    }

    // Verify signature
    const verified = nacl.sign.detached.verify(
      messageDecoded,
      signatureDecoded,
      publicKeyDecoded
    );

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Attach validated wallet to request
    req.validatedWallet = walletAddress;
    next();

  } catch (error) {
    console.error('Wallet validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Wallet validation failed',
      error: error.message
    });
  }
};

module.exports = validateWalletSignature;