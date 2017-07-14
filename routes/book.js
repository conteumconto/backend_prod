const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Student = require('../models/Student');

mongoose.Promise = global.Promise;

const passport = require('passport');

require('../config/passport')(passport);

const protect = passport.authenticate('jwt', {
  session: false,
});

router.get('/', (req, res) => {
  const book = {
    welcome_message: 'Book model',
    book: {
      _student: 'book owner id',
      title: 'title of book',
      summary: 'description >= 30 char',
      tags: [],
      active: 'status of book == true or false',
      chapters: [],
    },
  };
  res.json(book);
});

// create new book to student login
router.post('/:login', protect, (req, res) => {
  Student.findOne({
      login: req.params.login,
    })
    .then((student) => {
      //Token verification
      if ((req.user.login) == (student.login)) {
        req.body._students = student;
        Book.create(req.body).then((book) => {
          Student.findByIdAndUpdate(student._id, {
              $push: {
                books: [book],
              },
            })
            .catch((err) => {
              // todo-> error handling@can't update student
              res.status(400);
              res.json(err);
            });
          res.json(book);
        }).catch((err) => {
          // todo-> error handling@can't create book
          res.status(400);
          res.json(err);
        });
      } else {
        res.status(400);
        res.json({
          error: 'This token does not refer to this person.',
        });
      }
    }).catch(() => {
      // if not found student
      res.status(404);
      res.end();
    });

});

// all books from login
router.get('/:login', protect, (req, res) => {
  Student.findOne({
      login: req.params.login,
    })
    .then((student) => {
      Book.find({
        _students: student._id,
      }).then((books) => {
        //Token verification
        if ((req.user.login) == (req.params.login)) {
          res.json(books);
        } else {
          res.status(400);
          res.json({
            error: 'This token does not refer to this person.',
          });
        }
      }).catch((err) => {
        res.status(400);
        res.json(err);
      });
    }).catch((err) => {
      res.status(400);
      res.end();
    });
});

// book by id
router.get('/id/:book_id/', protect, (req, res) => {
  Book.findById(req.params.book_id).then((book) => {
    //Token verification
    if (book._students.indexOf(String(req.user._id)) == 0) {
      res.json(book);
    } else {
      res.status(400);
      res.json({
        error: 'This token does not refer to this person.',
      });
      res.end();
    }
  }).catch((err) => {
    // todo-> error handling@can't find book id
    res.status(400);
    res.json({
      error: 'book not found',
    });
  });
});

// update book by id
router.put('/id/:book_id', protect, (req, res) => {
  Book.findById(req.params.book_id).then((book) => {
    //find book_id in books of student(Token verification)
    if (req.user.books.indexOf(req.params.book_id) != -1) {
      Book.findByIdAndUpdate(req.params.book_id, req.body).then((updatedBook) => {
        res.status(200).send('Updated')
      }).catch((err) => {
        // todo-> error handling@can't update book id
        res.status(400);
        res.json(err);
      });
    } else {
      res.status(400);
      res.json({
        error: 'This token does not refer to this person.',
      });
    }
  }).catch((err) => {
    // todo-> error handling@can't update book id
    res.status(400);
    res.json(err);
  });

});

// delete book by id
router.delete('/id/:book_id', protect, (req, res) => {
  Book.findById(req.params.book_id).then((book) => {
    //find book_id in books of student(Token verification)
    if (req.user.books.indexOf(req.params.book_id) != -1) {
      Book.findByIdAndRemove(req.params.book_id).then((removedBook) => {
        Student.findByIdAndUpdate(req.user._id, {
            $pull: {
              books: [removedBook],
            },
          })
          .catch((err) => {
            // todo-> error handling@can't pull book in student array
            res.status(400);
            res.json(err);
          });
      }).catch((err) => {
        // todo-> error handling@can't delete book
        res.status(400);
        res.json(err);
      });
    } else {
      if (book != null) {
        res.status(400);
        res.json({
          error: 'This token does not refer to this person.',
        });
      } else {
        res.status(404).json({
          error: 'Book not found'
        })
      }
    }
    res.json({
      status: 'Sucesso'
    })
  }).catch((err) => {
    // todo-> error handling@can't find book 
    res.status(404);
    res.json(err);
  });
});

module.exports = router;