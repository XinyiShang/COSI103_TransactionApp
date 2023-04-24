const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');

const mongoose = require('mongoose');
const app = require('../app');

const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

router.get('/transactions', async (req, res) => {
  const sortBy = req.query.sortBy;
  let transactions;
  switch (sortBy) {
    case 'category':
      transactions = await Transaction.find().sort({ category: 1 });
      break;
    case 'amount':
      transactions = await Transaction.find().sort({ amount: 1 });
      break;
    case 'description':
      transactions = await Transaction.find().sort({ description: 1 });
      break;
    case 'date':
      transactions = await Transaction.find().sort({ date: 1 });
      break;
    default:
      transactions = await Transaction.find().sort({ date: -1 });
  }
  res.render('transactions', { transactions });
});


// add transaction
router.post('/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.redirect('/transactions'); 
    res.end("<script>location.reload();</script>");
    } catch (err) {
    res.status(400).send(err);
  }
});

// delete transaction
router.post('/transactions/delete/:transactionId', async (req, res, next) => {
  const transactionId = req.params.transactionId;
  try {
    await Transaction.findByIdAndDelete(transactionId);
    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.redirect('/transactions');
  }
});

// edit transaction
router.get('/transactions/edit/:transactionId', 
  async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.transactionId);
    res.locals.transaction = transaction;
    res.render('edit');
});

//update
router.post('/transactions/updateTransaction', 
  async (req, res, next) => {
    const { transactionId, description, amount, category, date } = req.body;
    await Transaction.findOneAndUpdate(
      { _id: transactionId },
      { $set: { description, amount, category, date } },
    );
    res.redirect('/transactions');
});

//group by category
router.get('/transactions/groupbycategory', async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    res.render('groupedTransactions', { transactions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;
