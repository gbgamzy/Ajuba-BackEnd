var mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userId: {
        type: String,
        index: { unique: true }
    },
    name: String,
    phone: String,
    token: String,
    dateOfBirth: String,
    otherId: String
});
const HODSchema = mongoose.Schema({
    userId: String,
    details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    groups: [{
        groupTitle: String,
        TeacherList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teachers'
            }
        ]
    }]
});
const ImageSchema = mongoose.Schema({
    image: { type: Buffer }
});
exports.ImageSchema = ImageSchema;
const TestSchema = mongoose.Schema({
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teachers'
    },
    student_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students'
    }],
    not_attempted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students'
    }],
    marks: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        marks: { type: Number }
    }],
    end_date: { type: Date },
    accepting: { type: Boolean },
    questions: [{
        type: String,
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Images'
        },
        mcq: {
            question: {
                number: Number,
                question: String
            },
            options: [{
                number: Number,
                option: String
            }],
            correct: Number,
            marks: Number
        },
        multiple_correct: {
            question: {
                number: Number,
                question: String
            },
            options: [{
                number: Number,
                option: String
            }],
            correct: [Number],
            marks: Number
        },
        integer_type: {
            question: {
                number: Number,
                question: String
            },
            correct: Number,
            marks: Number
        },
    }]
});
const CourseSchema = mongoose.Schema({
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tests'
    }],
    courseId: { type: String, index: { unique: true } },
    courseTitle: String,
    userList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', index: { unique: true }
    }],
    announcements: [{
        date: String,
        announcement: String,
        link: String,
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Images'
        }
    }]
});
const StudentSchema = mongoose.Schema({
    details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    }]
});
/*const user= mydb.model('Users',UserSchema);
const student= mydb.model('Students',StudentSchema);
const teacher= mydb.model('Teachers',StudentSchema);
const driver= mydb.model('Drivers',UserSchema);
const course=mydb.model('Courses',CourseSchema);
const image=mydb.model('Images',ImageSchema);
const test=mydb.model('Tests',TestSchema);
const hod=mydb.model('HODs',HODSchema);*/



module.exports= {
    /* User:user,
     Student:student,
     Teacher:teacher,
     Driver:driver,
     Course:course,
     Image:image,
     Test:test,
     HOD:hod*/
    
 
     
 
 };
 