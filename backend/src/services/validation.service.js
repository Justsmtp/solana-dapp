// src/services/validation.service.js
const Joi = require('joi');
const { REGEX } = require('../config/constants');

class ValidationService {
  // Validate wallet address
  validateWalletAddress(address) {
    const schema = Joi.string()
      .pattern(REGEX.SOLANA_ADDRESS)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Solana wallet address format',
        'any.required': 'Wallet address is required'
      });
    
    return schema.validate(address);
  }

  // Validate login request
  validateLogin(data) {
    const schema = Joi.object({
      walletAddress: Joi.string()
        .pattern(REGEX.SOLANA_ADDRESS)
        .required()
        .messages({
          'string.pattern.base': 'Invalid Solana wallet address'
        }),
      signature: Joi.string().required(),
      message: Joi.string().required()
    });
    
    return schema.validate(data);
  }

  // Validate profile update
  validateProfileUpdate(data) {
    const schema = Joi.object({
      username: Joi.string()
        .pattern(REGEX.USERNAME)
        .min(3)
        .max(20)
        .optional()
        .messages({
          'string.pattern.base': 'Username must be 3-20 characters, alphanumeric with - and _'
        }),
      email: Joi.string()
        .email()
        .optional(),
      bio: Joi.string()
        .max(500)
        .optional(),
      avatar: Joi.string()
        .uri()
        .optional(),
      preferences: Joi.object({
        theme: Joi.string()
          .valid('dark', 'light')
          .optional(),
        notifications: Joi.boolean()
          .optional()
      }).optional()
    });
    
    return schema.validate(data);
  }

  // Validate query parameters
  validateQueryParams(data) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().optional(),
      filter: Joi.string().optional()
    });
    
    return schema.validate(data);
  }

  // Validate transaction sync
  validateTransactionSync(data) {
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(50)
    });
    
    return schema.validate(data);
  }

  // Validate signature
  validateSignature(signature) {
    const schema = Joi.string()
      .base64()
      .required()
      .messages({
        'string.base64': 'Signature must be base64 encoded'
      });
    
    return schema.validate(signature);
  }

  // Validate transaction signature
  validateTransactionSignature(signature) {
    const schema = Joi.string()
      .min(64)
      .max(88)
      .required()
      .messages({
        'string.min': 'Invalid transaction signature length',
        'string.max': 'Invalid transaction signature length'
      });
    
    return schema.validate(signature);
  }

  // Validate pagination
  validatePagination(page, limit) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(100).required()
    });
    
    return schema.validate({ page, limit });
  }

  // Generic validation helper
  validate(data, schema) {
    return schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
  }

  // Format validation errors
  formatValidationErrors(error) {
    if (!error || !error.details) return null;
    
    return error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }
}

module.exports = new ValidationService();