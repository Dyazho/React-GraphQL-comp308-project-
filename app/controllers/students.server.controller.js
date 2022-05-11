// Load the module dependencies
const Student = require('mongoose').model('Student');
const Course = require('mongoose').model('Course');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const jwtExpirySeconds = 3000;
const jwtKey = config.secretKey;

//
// Create a new error handling controller method
const getErrorMessage = function (err) {
	// Define the error message variable
	var message = '';

	// If an internal MongoDB error occurs get the error message
	if (err.code) {
		switch (err.code) {
			// If a unique index error occurs set the message error
			case 11000:
			case 11001:
				message = 'Student number already exists';
				break;
			// If a general error occurs set the message error
			default:
				message = 'Server Error';
		}
	} else {
		// Grab the first error message from a list of possible errors
		message = err;
	}

	// Return the message error
	return message;
};
// Create a new user
exports.create = function (req, res, next) {
	// Create a new instance of the 'User' Mongoose model
	var student = new Student(req.body); //get data from React form
	console.log("body: " + req.body.studentNumber);
	console.log("course code: " + req.body.program);
	var studentCourseCode = req.body.program;
	var courseCodes;
	console.log(typeof req.body.program);
	if (typeof studentCourseCode === 'string') {
		courseCodes = studentCourseCode.split(',');
	} else if (typeof studentCourseCode === 'object') {
		courseCodes = studentCourseCode;
	}
	studentCourseCode = [];
	var iteration = courseCodes.length;
	courseCodes.forEach(element => {
		Course.findOne({ courseCode: element }, (err, course) => {
			console.log('course element:', element);
			console.log('course type:' + typeof course);
			console.log(course);
			if (err) { return getErrorMessage(err + "error at find one"); }
			if (!(course == null)) {
				studentCourseCode.push(course._id);
			} else {
				//courseCodes.splice(courseCodes.indexOf(element), 1);
				console.log("course not found");
			}
			req.courseCode = studentCourseCode.map(e => ObjectId(e.toString()));
			//
			//req.id = course._id;	
		}).then(function () {
			if (!--iteration) {
				student.program = req.courseCode;
				console.log('req.course._id', req.courseCode);
				student.save((err) => {
					if (err) {
						console.log('error in saving students: ', getErrorMessage(err))
						return res.status(400).send({
							message: getErrorMessage(err)
						});
					} else {
						res.status(200).json(student);
					}
				});
			}
		});

	});

	/*    Course.findOne({courseCode: req.body.program}, (err, course) => {
	
			if (err) { return getErrorMessage(err); }
			if(!course){return getErrorMessage("course not found!");}
			//
			req.id = course._id;
			console.log('course._id',req.id);
	
		
		}).then( function () 
		{
			student.program = req.id
			console.log('req.course._id',req.id);
	
			student.save((err) => {
				if (err) {
					console.log('error', getErrorMessage(err))
	
					return res.status(400).send({
						message: getErrorMessage(err)
					});
				} else {
					res.status(200).json(student);
				}
			});
	    
		});
	
		// Use the 'User' instance's 'save' method to save a new user document
		student.save(function (err) {
			if (err) {
				// Call the next middleware with an error message
				return next(err);
			} else {
				// Use the 'response' object to send a JSON response
				res.json(student);
			    
			}
		});*/
};
//
// Returns all users
exports.list = function (req, res, next) {
	Student.find().populate('program', 'courseCode courseName section').exec((err, student) => {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.status(200).json(student);
		}
	});

	/*
		// Use the 'User' instance's 'find' method to retrieve a new user document
		Student.find({}, function (err, students) {
			if (err) {
				return next(err);
			} else {
				res.json(students);
			}
		});*/
};
exports.listStudentsByCourse = function (req, res, next, id) {
	Student.find().populate('program', 'courseCode').where('program').equals(id).exec((err, student) => {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.status(200).json(student);
		}
	});
}
//
//'read' controller method to display a user
exports.read = function (req, res) {
	console.log("enter student read");
	// Use the 'response' object to send a JSON response
	res.json(req.student);
};
//
// 'userByID' controller method to find a user by its id
exports.studetnById = function (req, res, next, id) {
	Student.findById(id).populate('program').exec((err, student) => {
		if (err) return next(err);
		if (!student) return next(new Error('Failed to load student '
			+ id));
		req.student = student;
		console.log('in student by id:', req.student)
		next();
	});

	/*   
   // Use the 'User' static 'findOne' method to retrieve a specific user
   Student.findOne({
	   _id: id
   }, (err, student) => {
	   if (err) {
		   // Call the next middleware with an error message
		   return next(err);
	   } else {
		   // Set the 'req.user' property
		   req.student = student;
		   console.log(student);
		   // Call the next middleware
		   next();
	   }
   });*/
};
//update a user by id
exports.update = function (req, res, next) {
	console.log(req.body);
	console.log("course code: " + req.body.program);
	var studentCourseCode = req.body.program;
	var courseCodes;
	console.log(typeof req.body.program);
	if (typeof studentCourseCode === 'string') {
		courseCodes = studentCourseCode.split(',');
	} else if (typeof studentCourseCode === 'object') {
		courseCodes = studentCourseCode;
	}
	studentCourseCode = [];
	var iteration = courseCodes.length;
	courseCodes.forEach(element => {
		Course.findOne({ courseCode: element }, (err, course) => {
			if (!(course == null)) {
				studentCourseCode.push(course._id);
			} else {
				//courseCodes.splice(courseCodes.indexOf(element), 1);
				console.log("course not found");
			}
			req.courseCode = studentCourseCode.map(e => ObjectId(e.toString()));
			if (err) { return getErrorMessage(err); }
			//
			//req.id = course._id;
			console.log('course._id', req.courseCode);
			if (!--iteration) {
				Student.findByIdAndUpdate(req.student.id,
					{
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						studentNumber: req.body.studentNumber, //password: bcrypt.hashSync(req.body.password,10),
						
						address: req.body.address,
						phoneNumber: req.body.phoneNumber,
						program: req.courseCode
					},
					function (err, student) {
						if (err) {
							console.log(err);
							return next(err);
						}
						res.json(req.student);
					})
			}
		});
	});
};
// delete a user by id
exports.delete = function (req, res, next) {
	Student.findByIdAndRemove(req.student.id, req.body, function (err, student) {
		if (err) return next(err);
		res.json(student);
	});
};
//
// authenticates a user
exports.authenticate = function (req, res, next) {
	// Get credentials from request
	console.log(req.body)
	const studentNumber = req.body.auth.studentNumber;
	const password = req.body.auth.password;
	console.log(password)
	console.log(studentNumber)
	//find the user with given username using static method findOne
	Student.findOne({ studentNumber: studentNumber }, (err, student) => {
		if (err) {
			return next(err);
		} else if(student == null){
			res.status(200).send({error:"Student number does not exist!!"});
		}else {
			console.log("no error in find");
			console.log(student)
			console.log(password);
			console.log(student.password);
			//compare passwords	
			if (bcrypt.compareSync(password, student.password)) {
				console.log("enter compare");
				// Create a new token with the user id in the payload
				// and which expires 300 seconds after issue
				const token = jwt.sign({ id: student._id, studentNumber: student.studentNumber }, jwtKey,
					{ algorithm: 'HS256', expiresIn: jwtExpirySeconds });
				console.log('token:', token)
				// set the cookie as the token string, with a similar max age as the token
				// here, the max age is in milliseconds
				res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000, httpOnly: true });
				res.status(200).send({ screen: student.studentNumber });
				//
				//res.json({status:"success", message: "user found!!!", data:{user:
				//user, token:token}});

				req.student = student;
				//call the next middleware
				next()
			} else {
				console.log("error in verify password");
				res.status(200).send({error:"Invalid password!!"});
				/*
				res.json({
					status: "error", message: "Invalid student number/password!!!",
					data: null
				});*/
			}

		}

	});
};
//
// protected page uses the JWT token
exports.welcome = (req, res) => {
	// We can obtain the session token from the requests cookies,
	// which come with every request
	const token = req.cookies.token
	console.log(token)
	// if the cookie is not set, return an unauthorized error
	if (!token) {
		return res.status(401).end()
	}

	var payload;
	try {
		// Parse the JWT string and store the result in `payload`.
		// Note that we are passing the key in this method as well. This method will throw an error
		// if the token is invalid (if it has expired according to the expiry time we set on sign in),
		// or if the signature does not match
		payload = jwt.verify(token, jwtKey)
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			return res.status(401).end()
		}
		// otherwise, return a bad request error
		return res.status(400).end()
	}

	// Finally, return the welcome message to the user, along with their
	// username given in the token
	// use back-quotes here
	res.send(`${payload.studentNumber}`)
};
//
//sign out function in controller
//deletes the token on the client side by clearing the cookie named 'token'
exports.signout = (req, res) => {
	res.clearCookie("token")
	return res.status('200').json({ message: "signed out" })
	// Redirect the user back to the main application page
	//res.redirect('/');
}
//check if the user is signed in
exports.isSignedIn = (req, res) => {
	// Obtain the session token from the requests cookies,
	// which come with every request
	const token = req.cookies.token
	console.log(token)
	// if the cookie is not set, return 'auth'
	if (!token) {
		return res.send({ screen: 'auth' }).end();
	}
	var payload;
	try {
		// Parse the JWT string and store the result in `payload`.
		// Note that we are passing the key in this method as well. This method will throw an error
		// if the token is invalid (if it has expired according to the expiry time we set on sign in),
		// or if the signature does not match
		payload = jwt.verify(token, jwtKey)
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// the JWT is unauthorized, return a 401 error
			return res.status(401).end()
		}
		// otherwise, return a bad request error
		return res.status(400).end()
	}

	// Finally, token is ok, return the username given in the token
	res.status(200).send({ screen: payload.studentNumber });
}

//isAuthenticated() method to check whether a user is currently authenticated
exports.requiresLogin = function (req, res, next) {
	// Obtain the session token from the requests cookies,
	// which come with every request
	const token = req.cookies.token
	console.log(token)
	// if the cookie is not set, return an unauthorized error
	if (!token) {
		return res.send({ screen: 'auth' }).end();
	}
	var payload;
	try {
		// Parse the JWT string and store the result in `payload`.
		// Note that we are passing the key in this method as well. This method will throw an error
		// if the token is invalid (if it has expired according to the expiry time we set on sign in),
		// or if the signature does not match
		payload = jwt.verify(token, jwtKey)
		console.log('in requiresLogin - payload:', payload)
		req.id = payload.id;
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			return res.status(401).end()
		}
		// otherwise, return a bad request error
		return res.status(400).end()
	}
	// user is authenticated
	//call next function in line
	next();
};