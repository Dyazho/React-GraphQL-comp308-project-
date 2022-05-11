var jwt = require('jsonwebtoken');
var dotenv =require ('dotenv');
var Student = require('../models/student.server.model');

var { private_key, public_key }=require('./keys.js');

dotenv.config();

export const verifyToken = async (req, res, next) => {

    const authToken = req.get('Authorization');
    if (!authToken) {
        req.isAuth = false;
        return next()
    }
    const token = authToken.split(' ')[1];
    let verify;
    try {
        verify = jwt.verify(token, public_key);
    } catch (error) {
        req.isAuth = false;
        return next()
    }
    if (!verify._id) {
        req.isAuth = false;
        return next()
    }
    const student = await Student.findById(verify._id);
    if (!student) {
        req.isAuth = false;
        return next()
    }
    req.userId = user._id;
    req.isAuth = true;
    next()
}