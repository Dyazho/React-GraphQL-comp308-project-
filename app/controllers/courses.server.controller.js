const mongoose = require('mongoose');
const Course = mongoose.model('Course');
//
function getErrorMessage(err) {
    if (err.errors) {
        for (let errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].
                message;
        }
    } else {
        return 'Unknown server error';
    }
};
//
exports.create = function (req, res) {
    const course = new Course();
    course.courseCode = req.body.courseCode;
    course.courseName = req.body.courseName;
    course.section = req.body.section;
    course.semester=req.body.semester;
    console.log(req.body)
    course.save((err) => {
        if (err) {
            console.log('error', getErrorMessage(err))

            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(course);
        }});
};
//
exports.list = function (req, res) {
    console.log("enter list");
    Course.find({}, function (err, courses) {
        if (err) {
            return next(err);
        } else {
            res.json(courses);
        }
    });
};
//
exports.courseByID = function (req, res, next, id) {
    console.log("enter course by id");
    Course.findById(id).exec((err, course) => {if (err) return next(err);
    if (!course) return next(new Error('Failed to load course '
            + id));
        req.course = course;
        console.log('in courseById:', req.course)
        next();
    });
};
//
exports.read = function (req, res) {
    console.log("enter read");
    res.json(req.course);
};
//
exports.update = function (req, res) {
    console.log('in update:', req.course)
    const course = req.course;
    course.courseCode = req.body.courseCode;
    course.courseName = req.body.courseName;
    course.section = req.body.section;
    course.semester=req.body.semester;
    course.save((err) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(course);
        }
    });
};
//
exports.delete = function (req, res) {
    const course = req.course;
    course.remove((err) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(course);
        }
    });
};
/*
//The hasAuthorization() middleware uses the req.article and req.user objects
//to verify that the current user is the creator of the current article
exports.hasAuthorization = function (req, res, next) {
    console.log('in hasAuthorization - creator: ',req.article.creator)
    console.log('in hasAuthorization - user: ',req.id)
    //console.log('in hasAuthorization - user: ',req.user._id)


    if (req.article.creator.id !== req.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
*/