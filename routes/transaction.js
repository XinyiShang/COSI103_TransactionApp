const express = require('express');
const router = express.Router();

const path = require('path');
//const Transaction = require(path.join(__dirname, '..', 'models', 'transaction'));
const Transaction = require('../models/Transaction');

const mongoose = require('mongoose');
const app = require('../app');

const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));


router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.render('transaction', { transactions });
  } catch (err) {
    res.status(500).send(err);
  }
});


// Define a route to get a specific transaction by ID
router.get('/:id', getTransaction, (req, res) => {
  res.json(res.transaction);
});

// Define a route to create a new transaction
router.post('/', async (req, res) => {
  const transaction = new Transaction({
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Define a middleware function to retrieve a specific transaction by ID
async function getTransaction(req, res, next) {
  try {
    transaction = await Transaction.findById(req.params.id);
    if (transaction == null) {
      return res.status(404).json({ message: 'Cannot find transaction' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.transaction = transaction;
  next();
}

module.exports = router;
