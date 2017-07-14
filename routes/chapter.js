const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Book = require('../models/Book');
const Chapter = require('../models/Chapters');

mongoose.Promise = global.Promise;

const passport = require('passport');

require('../config/passport')(passport);

const protect = passport.authenticate('jwt', {
  session: false,
});

router.get('/', protect, (req, res) => {
  const book = {
    welcome_message: 'Chapters model',
    chapter: {
      _chapter: 'chaptes ID',
      title: 'title of chapter',
      chapterText: 'text-html',
    },
  };
  res.json(book);
});


router.post('/:id_book', protect, (req, res) => {
  Book.findOne({
      _id: req.params.id_book,
    })
    .then((book) => {
      //Token verification
      if (req.user.books.indexOf(String(req.params.id_book)) != -1) {
        req.body._book = book;
        Chapter.create(req.body).then((chapter) => {
          Book.findByIdAndUpdate(book._id, {
              $push: {
                chapters: [chapter],
              },
            })
            .catch((err) => {
              // todo-> error handling@can't update book
              res.status(400);
              res.json(err);
            });
          res.json(chapter);
        }).catch((err) => {
          // todo-> error handling@can't create chapter
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
      // if not found book
      res.status(404);
      res.end();
    });
});
// all chapters from book id
router.get('/:id_book', protect, (req, res) => {
  Chapter.find({
    _book: req.params.id_book,
  }).then((chapters) => {
    if (req.user.books.indexOf(String(req.params.id_book)) != -1) {
      res.json(chapters);
    } else {
      res.status(400);
      res.json({
        error: 'This token does not refer to this person.',
      });
    }
  }).catch((err) => {
    // todo-> error handling@can't find chapters to book id
    res.status(400);
    res.json(err);
  });

});

router.get('/id/:id_chapter', protect, (req, res) => {
  Chapter.findById(req.params.id_chapter).then((chapter) => {
    //Token Verification
    if (req.user.books.indexOf(chapter._book) != -1) {
      res.json(chapter);
    } else {
      res.status(400);
      res.json({
        error: 'This token does not refer to this person.',
      });
    }
  }).catch((err) => {
    // todo-> error handling@can't find chapters id
    res.status(404);
    res.json(err);
  });
});

router.put('/id/:id_chapter', protect, (req, res) => {
  Chapter.findById(req.params.id_chapter).then((chapter) => {
    //Token autentication
    if (req.user.books.indexOf(chapter._book) != -1) {
      Chapter.findByIdAndUpdate(req.params.id_chapter, req.body).then((updatedChapter) => {
        res.json(updatedChapter)
      }).catch((err) => {
        // todo-> error handling@can't update chapters id
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
    // todo-> error handling@can't find chapters id
    res.status(400);
    res.json(err);
  });
});

router.delete('/id/:id_chapter', protect, (req, res) => {
  Chapter.findById(req.params.id_chapter).then((chapter) => {
    if (req.user.books.indexOf(chapter._book) != -1) {
      Chapter.find().remove({
        _id: req.params.id_chapter
      }).exec();
      Book.find().update({
        _id: chapter._book
      }, {
        $pull: {
          chapters: [chapter],
        }
      }).exec();
      res.status(200).json(chapter);
    } else {
      res.status(400);
      res.json({
        error: 'This token does not refer to this person.',
      });
    }
    return next()
  }).catch((err) => {
    // todo-> error handling@can't delete chapters id
    res.status(400);
    res.json(err);
  });
});

module.exports = router;