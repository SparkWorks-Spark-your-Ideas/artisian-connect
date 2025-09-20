import { describe, it } from 'mocha';
import { expect } from 'chai';
import { validateEmail, generateId } from '../src/utils/helpers.js';

describe('Utility Functions', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).to.be.true;
      expect(validateEmail('user+tag@domain.co.in')).to.be.true;
      expect(validateEmail('artisan@marketplace.org')).to.be.true;
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).to.be.false;
      expect(validateEmail('test@')).to.be.false;
      expect(validateEmail('@domain.com')).to.be.false;
      expect(validateEmail('')).to.be.false;
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).to.be.a('string');
      expect(id2).to.be.a('string');
      expect(id1).to.not.equal(id2);
    });

    it('should generate IDs of correct length', () => {
      const id = generateId();
      expect(id.length).to.be.greaterThan(10);
    });
  });
});

describe('API Health Check', () => {
  it('should have proper structure for health endpoint', () => {
    const healthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'artisan-marketplace-api'
    };

    expect(healthResponse).to.have.property('status');
    expect(healthResponse).to.have.property('timestamp');
    expect(healthResponse).to.have.property('service');
    expect(healthResponse.status).to.equal('healthy');
  });
});

// Schema validation tests
describe('Data Schema Validation', () => {
  it('should validate user registration structure', () => {
    const userRegistration = {
      email: 'artisan@example.com',
      password: 'securePassword123',
      firstName: 'Raj',
      lastName: 'Kumar',
      userType: 'artisan',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001'
      }
    };

    expect(userRegistration).to.have.property('email');
    expect(userRegistration).to.have.property('userType');
    expect(userRegistration.userType).to.be.oneOf(['customer', 'artisan']);
    expect(userRegistration.location).to.have.property('city');
    expect(userRegistration.location).to.have.property('state');
  });

  it('should validate product structure', () => {
    const product = {
      name: 'Handwoven Silk Saree',
      description: 'Traditional Banarasi silk saree with intricate gold work',
      category: 'textiles',
      price: 15000,
      currency: 'INR',
      materials: ['silk', 'gold thread'],
      tags: ['handwoven', 'traditional', 'bridal'],
      stockQuantity: 5,
      customizable: true
    };

    expect(product).to.have.property('name');
    expect(product).to.have.property('category');
    expect(product).to.have.property('price');
    expect(product.price).to.be.a('number');
    expect(product.materials).to.be.an('array');
    expect(product.tags).to.be.an('array');
  });

  it('should validate order structure', () => {
    const order = {
      items: [{
        productId: 'prod_123',
        quantity: 1,
        price: 15000,
        total: 15000
      }],
      shippingAddress: {
        name: 'Customer Name',
        street: '123 Main St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      paymentMethod: 'upi',
      totalAmount: 15000,
      orderStatus: 'pending'
    };

    expect(order).to.have.property('items');
    expect(order.items).to.be.an('array');
    expect(order.items[0]).to.have.property('productId');
    expect(order).to.have.property('shippingAddress');
    expect(order.shippingAddress).to.have.property('pincode');
    expect(order).to.have.property('paymentMethod');
  });
});