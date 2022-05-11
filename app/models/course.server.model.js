const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CourseSchema = new Schema({
    courseCode: {
        type: String,
        default: '',
        trim:true,
        required:'Course Code cannot be blank'
    },
    courseName: {
        type: String,
        default: '',
        trim: true,
        required: 'Course Name cannot be blank'
    },
    section: {
        type: Number, 
        default: 0,
        trim: true,
        required:'Section cannot be blank'
    },
    semester: {
        type: Number,
        default:0,
        trim: true,
        required:'Semester cannot be blank'
    }
});
module.exports =mongoose.model('Course', CourseSchema);
