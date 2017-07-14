const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const ClassGroup = require('../models/ClassGroup');

mongoose.Promise = global.Promise;

const passport = require('passport');

require('../config/passport')(passport);

var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZçÇ');

const protect = passport.authenticate('jwt', {
    session: false,
});

// Create class
router.post('/', protect, (req, res) => {
    // is a teacher ?
    if (req.user.__t == "Teacher") {
        ClassGroup.create(req.body)
            .then((classgroup) => {
                //Created
                res.status(201).json(classgroup);
            }).catch((err) => {
                //Code duplicate
                if (err.code == 11000 && err.errmsg.match(/code_1/)) {
                    //generate new class id
                    req.body.code = shortid.generate();
                    ClassGroup.create(req.body);
                    res.status(201).json(req.body);
                }
                //Others errors
                res.status(400).json(err);
            });
    } else {
        //Not a teacher
        res.status(400).json({
            error: 'Sorry, you are not a teacher'
        })
    }

});

// Return class by teacher_id
router.get('/:teacher_id/', protect, (req, res) => {
    ClassGroup.find({
        teacher: req.params.teacher_id
    }).then((classes) => {
        if (String(req.user._id) == String(req.params.teacher_id)) {
            res.status(200).json(classes);
        } else {
            res.status(400).json({
                error: 'You are not the teacher who created this class'
            });
        }
    }).catch((err) => {
        // todo-> error handling@can't find class id
        res.status(400).json(err);
    });
});


// Return class by id
router.get('/id/:classgroup_id/', protect, (req, res) => {
    ClassGroup.findById(req.params.classgroup_id).then((classgroup) => {
        res.json(classgroup);
    }).catch((err) => {
        // todo-> error handling@can't find class id
        res.status(400).json(err);
    });
});

//
router.delete('/id/:classgroup_id/', protect, (req, res) => {
    ClassGroup.findById(req.params.classgroup_id).then((classgroup) => {
        // if class != null
        if (classgroup) {
            // If teacher created this class
            if (String(req.user._id) == String(classgroup.teacher)) {
                ClassGroup.remove({
                    _id: req.params.classgroup_id,
                }).then(() => {
                    //Removed
                    res.status(200).end();
                }).catch((err) => {
                    // todo: refac erro handler
                    res.status(400).json(err);
                });
            } else {
                res.status(400).json({
                    error: 'You are not the teacher who created this class'
                });
            }
        } else {
            // if class == null
            res.status(400).json({
                error: 'Class doesn\'t exist'
            })
        }

    }).catch((err) => {
        // todo-> error handling@can't find class id
        res.status(400).json(err);
    });
});

router.put('/id/:classgroup_id/', protect, (req, res) => {
    //Search class
    ClassGroup.findById(req.params.classgroup_id).then((classgroup) => {
        // If teacher created this class
        if (String(req.user._id) == String(classgroup.teacher)) {
            //Update
            ClassGroup.update({
                _id: req.params.classgroup_id
            }, req.body).then((modified) => {
                res.status(200).json(modified);
            }).catch((err) => {
                // todo-> error handling@can't update chapters id
                res.status(400).json(err);
            });
        } else {
            res.status(400).json({
                error: 'You are not the teacher who created this class'
            });
        }
        res.status(200);
    }).catch((err) => {
        res.status(400).json({
            error: 'Class doesn\'t exist'
        });
    })

});

module.exports = router;