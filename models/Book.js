const mongoose = require('mongoose');

/**
 * Restrictions
 */

const studentsRestriction = [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Student',
  required: true,
}];

const titleRestriction = {
  type: String,
  required: [true, 'no title given'],
  minlength: [1, 'title is too short'],
  max: [40, 'title is too long'],
};

const summaryRestriction = {
  type: String,
};

const tagsRestriction = [{
  type: String,
}];

const activeRestriction = {
  type: Boolean,
  default: true,
};

const chaptersRestriction = [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Chapters',
  required: true,
}];

/**
 * Book Schema
 */

const BookSchema = new mongoose.Schema({
  _students: studentsRestriction,
  title: titleRestriction,
  summary: summaryRestriction,
  tags: tagsRestriction,
  active: activeRestriction,
  chapters: chaptersRestriction,
});


module.exports = mongoose.model('Book', BookSchema);
