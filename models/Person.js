const mongoose = require('mongoose');

// This model refers to the creation of any person(Student, Teacher...), which will be inherited by other models.

/**
 * Restrictions
 */

const nameRestriction = {
    type: String,
    required: [true, 'No name given'],
    minlength: [3, 'Name too short'],
    maxlength: [100, 'Name too big'],
};

const birthDayRestriction = {
    type: String,
    required: [true, 'No birth day given'],
};

const loginRestriction = {
    type: String,
    required: [true, 'No login given'],
    index: {
        unique: true,
    },
};

const passwordRestriction = {
    type: String,
    required: [true, 'No password given'],
};


// Create Schema
const PersonSchema = new mongoose.Schema({
    first_name: nameRestriction,
    last_name: nameRestriction,
    birth_day: birthDayRestriction,
    login: loginRestriction,
    password: passwordRestriction,
});

module.exports = mongoose.model('Person', PersonSchema);