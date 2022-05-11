

var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLDate = require('graphql-date');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var private_key = require('../helpers/keys');

const { ObjectId } = require('mongodb');
/*
var CourseModel = require('mongoose').model('Course');
var StudentModel=require('mongoose').model('Student');
*/
var CourseModel = require('../models/course.server.model');
var StudentModel = require('../models/student.server.model');


const courseType = new GraphQLObjectType({
    name: 'course',
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            courseCode: {
                type: GraphQLString
            },
            courseName: {
                type: GraphQLString
            },
            section: {
                type: GraphQLInt
            },
            semester: {
                type: GraphQLInt
            }
        }
    }
});

const studentType = new GraphQLObjectType({
    name: 'student',
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            firstName: {
                type: GraphQLString
            },
            lastName: {
                type: GraphQLString
            },
            email: {
                type: GraphQLString
            },
            studentNumber: {
                type: GraphQLInt
            },
            password: {
                type: GraphQLString
            },
            address: {
                type: GraphQLString
            },
            phoneNumber: {
                type: GraphQLString
            },
            program: {
                type: GraphQLList(courseType)
            }
        }
    }
});

const loginReturnType = new GraphQLObjectType({
    name: 'loginReturnType',
    fields: function () {
        return {
            token: {
                type: GraphQLString
            },
            studentId: {
                type: GraphQLString
            },
            studentNumber:{
                type:GraphQLInt
            }
        }
    }
});

const courseInStudent = courseIds => {
    try {
        console.log(courseIds.length);
        /*
        var itemProceed = 0;
        var courseList =[];
        courseIds.forEach(async(element)=>{
            var courseFound = await CourseModel.findById(element);
            if(courseFound){
                console.log("course found: ",courseFound);
                courseList.push(courseFound);
            }
            itemProceed++;
            if(itemProceed===courseIds.length){
                console.log("course list: ",courseList);
                return courseList;
            }
            
        });*/
        
        const course = CourseModel.findById(courseId).exec();
        console.log(course);
        console.log(typeof course);
        return {
            course
        };
    } catch (err) {
        console.log(err);
        throw new Error("error in course in student", err);
    }
};

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: function () {
        return {
            //list all courses
            courses: {
                type: new GraphQLList(courseType),
                resolve: function (req) {
                    /*
                    if(!req.isAuth){
                        throw new Error("user has to login to check courses list info");
                    }*/
                    const courses = CourseModel.find().exec()
                    if (!courses) {
                        throw new Error('Error in retriving course list');
                    }
                    return courses;
                }
            },
            //get course by id
            course: {
                type: courseType,
                args: {
                    id: {
                        name: 'id',
                        type: GraphQLString
                    }
                },
                resolve: function (req, root, params) {
                    /*
                    if(!req.isAuth){
                        throw new Error("user has to login to check course info");
                    }
                    */
                    const courseInfo = CourseModel.findById(params.body.variables.id).exec()
                    console.log(courseInfo);
                    console.log(params.body.variables.id);
                    if (!courseInfo) {
                        throw new Error('Error retriving course ' + params.body.variables.id);
                    }
                    return courseInfo
                }
            },
            // list all students
            students: {
                type: new GraphQLList(studentType),
                resolve: async function (req) {
                    if (!req.isAuth) {
                        throw new Error("user has to login to check student list info");
                    }
                    const students = await StudentModel.find();
                    if (!students) {
                        throw new Error('Error in retreving student list');
                    }
                    console.log(students);
                    //return students;
                    return students.map(student=>({
                        ...student._doc,
                        program:student.program.map(e=>(CourseModel.findById(e.toString()).exec())) 
                    }));
                }
            },
            //list student by course
            studentByCourse: {
                type: new GraphQLList(studentType),
                args: {
                    program: {
                        name: 'program',
                        type: GraphQLString
                    }
                },
                resolve: async function (req,root, params) {
                    if (!req.isAuth) {
                        throw new Error('user has to login to check student by course info');
                    }
                    const students = await StudentModel.find().where('program').equals(params.body.variables.program);
                    if (!students) {
                        throw new Error('Error in retreving student by course list');
                    }
                    return students.map(student=>({
                        ...student._doc,
                        program:student.program.map(e=>(CourseModel.findById(e.toString()).exec())) 
                    }));
                }
            },
            // student by id
            student: {
                type: studentType,
                args: {
                    id: {
                        name: 'id',
                        type: GraphQLString
                    }
                },
                resolve: function (req,root, params) {
                    if (!req.isAuth) {
                        throw new Error('user has to login to check student info');
                    }
                    const student = StudentModel.findById(params.body.variables.id).populate('program').exec();
                    if (!student) {
                        throw new Error('Error in retreving student ' + params.body.variables.id);
                    }
                    return student;
                }
            }
            //signout
        }
    }
});



const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            //add course
            addCourse: {
                type: courseType,
                args: {
                    courseCode: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    courseName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    section: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    semester: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function (req, root, params) {
                    /*
                    if(!req.isAuth){
                        throw new Error("user has to login to add course info");
                    }
                    */
                    console.log(params);
                    const courseModel = new CourseModel(params.body.variables);
                    const newCourse = courseModel.save();
                    if (!newCourse) {
                        throw new Error('Error in saving new course');
                    }
                    return newCourse;
                }
            },
            // update course
            updateCourse: {
                type: courseType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    courseCode: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    courseName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    section: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    semester: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function (req, root, params) {
                    /*
                    if(!req.isAuth){
                        throw new Error("user has to login to update course");
                    }
                    */
                    const updateCourse = CourseModel.findByIdAndUpdate(params.body.variables.id, {
                        courseCode: params.body.variables.courseCode,
                        courseName: params.body.variables.courseName,
                        section: params.body.variables.section,
                        semester: params.body.variables.semester
                    }, function (error) {
                        if (error) return next(error);
                    });
                    if (!updateCourse) {
                        throw new Error('Error in update course ' + params.body.variables.id);
                    }
                    return updateCourse;
                }
            },
            //delete course
            deleteCourse: {
                type: courseType,
                args: {
                    id: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (req, roor, params) {
                    /*
                    if(!req.isAuth){
                        throw new Error("user has to login to delete course");
                    }
                    */
                    const deleteCourse = CourseModel.findByIdAndRemove(params.body.variables.id).exec();
                    if (!deleteCourse) {
                        throw new Error('Error in removing course ' + params.body.variables.id);
                    }
                    return deleteCourse;
                }
            },
            // add student
            addStudent: {
                type: studentType,
                args: {
                    firstName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    lastName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    email: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    studentNumber: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    password: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    address: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    phoneNumber: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    program: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: async function (req, root, params) {
                    var student = new StudentModel(params.body.variables);
                    console.log(params.body.variables.program)
                    var studentCourseCode = params.body.variables.program;
                    var courseCodes;
                    if (typeof studentCourseCode === 'string') {
                        courseCodes = studentCourseCode.split(',');
                    } else if (typeof studentCourseCode === 'Object') {
                        courseCodes = studentCourseCode;
                    }
                    var studentCourseCode = [];
                    console.log(courseCodes);
                    console.log(courseCodes.length);
                    var itemProceed=1;
                    courseCodes.forEach(async(element) => {
                        var foundCourse = await CourseModel.findOne({ courseCode: element });
                        studentCourseCode.push(foundCourse._id);
                        if(itemProceed === courseCodes.length){
                            console.log(studentCourseCode);
                            student.program = studentCourseCode;
                            var newStudent = await student.save();

                        }
                        itemProceed++;
                    });
                    return {
                        ...student._doc,
                        program:student.program.map(e=>(CourseModel.findById(e.toString()).exec()))
                    };
                }
            },
            // update student
            updateStudent: {
                type: studentType,
                args: {
                    id: {
                        name: 'id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    firstName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    lastName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    email: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    studentNumber: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    address: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    phoneNumber: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    program: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (req, root, params) {
                    if (!req.isAuth) {
                        throw new Error("user has to login to update student");
                    }
                    var student = new StudentModel(params.body.variables);
                    var studentCourseCode = params.body.variables.program;
                    var courseCodes;
                    if (typeof studentCourseCode === 'string') {
                        courseCodes = studentCourseCode.split(',');
                    } else if (typeof studentCourseCode === 'Object') {
                        courseCodes = studentCourseCode;
                    }
                    var studentCourseCode = [];
                    console.log(courseCodes);
                    console.log(courseCodes.length);
                    var itemProceed=1;
                    courseCodes.forEach(async(element) => {
                        var foundCourse = await CourseModel.findOne({ courseCode: element });
                        studentCourseCode.push(foundCourse._id);
                        if(itemProceed === courseCodes.length){
                            console.log(studentCourseCode);
                            StudentModel.findByIdAndUpdate(params.body.variables.id,
                                {
                                    firstName: params.body.variables.firstName,
                                    lastName: params.body.variables.lastName,
                                    email: params.body.variables.email,
                                    studentNumber: params.body.variables.studentNumber, //password: bcrypt.hashSync(req.body.password,10),
                                    address: params.body.variables.address,
                                    phoneNumber: params.body.variables.phoneNumber,
                                    program: studentCourseCode
                                },
                                function (err, student) {
                                    if (err) {
                                        throw new Error('error in updating student ' + params.body.variables.id);
                                    }
                                    return student;
                                })

                        }
                        itemProceed++;
                    });
                    return {
                        ...student._doc,
                        program:student.program.map(e=>(CourseModel.findById(e.toString()).exec()))
                    };
                }
            },
            // delete student
            deleteStudent: {
                type: studentType,
                args: {
                    id: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (req, root, params) {
                    if (!req.isAuth) {
                        throw new Error("user has to login to delete student");
                    }
                    const deleteStudent = StudentModel.findByIdAndRemove(params.body.variables.id).exec();
                    if (!deleteStudent) {
                        throw new Error('error in removing student ' + params.body.variables.id);
                    }
                    return deleteStudent;
                }
            },
            // login
            login: {
                type: loginReturnType,
                args: {
                    studentNumber: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    password: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: async function (req, root, params) {

                    console.log(params.body.variables.password);
                    studentNumber = params.body.variables.studentNumber;
                    console.log(studentNumber);
                    password = params.body.variables.password;
                    try {

                        var studentOne = await StudentModel.findOne({ studentNumber: studentNumber },
                            function (error, student) {
                                if (error) {
                                    throw error;
                                }
                                console.log(student);
                                studentOne = student;
                            });
                        if (!studentOne) {
                            throw new Error('Student number does not exist');
                        }
                        console.log(password);
                        console.log("student", studentOne.password);
                        const isCorrectPassword = bcrypt.compareSync(password, studentOne.password);
                        if (!isCorrectPassword) {
                            throw new Error("Invalid password");
                        }
                        const token = jwt.sign({ _id: studentOne._id, studentNumber: studentOne.studentNumber }, private_key, {
                            algorithm: "HS256", expiresIn: 30000
                        });
                        console.log({
                            token: token,
                            studentId: studentOne._id
                        });
                        req.isAuth=true;
                        return {
                            token: token,
                            studentId: studentOne._id,
                            studentNumber:studentOne.studentNumber
                        }


                    } catch (error) {
                        return error
                    }
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });