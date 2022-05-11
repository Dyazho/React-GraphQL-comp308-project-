const students = require('../../app/controllers/students.server.controller');
const courses = require('../../app/controllers/courses.server.controller');
//
module.exports = function (app) {
        
        app.route('/api/courses')
            .get(students.requiresLogin,courses.list)
            .post(students.requiresLogin,courses.create);
        //
        app.param('id',courses.courseByID);
        app.route('/api/courses/:id')
            .get(courses.read)
            .put(students.requiresLogin,courses.update)
            .delete(students.requiresLogin,courses.delete);
        //

};
