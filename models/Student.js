const mongoose = require('mongoose');
const Person = require('./Person');

/**
 * Restrictions
 */

const bookRestriction = [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Book',
}];

const emailRestriction = {
  type: String,
  index: [{
    // Unique + Sparse = If the email is not null, it has to be unique
    unique: true,
    sparse: true,
  }],
};

// Inheritance of the person model

const StudentSchema = new mongoose.Schema({
  books: bookRestriction,
  email: emailRestriction
});

// Mongoose discriminator == Inheritance
module.exports = Person.discriminator('Student', StudentSchema);