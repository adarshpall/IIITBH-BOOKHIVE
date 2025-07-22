import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    fatherName: {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique: true,
    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        required : true,
        default : "Student",
        enum : ["Student","Admin","Teacher","HOD","Clerk"]
    },

    accountStatus : {
        type : String,
        default : "Active",
        enum : ["Active","Disabled"]
    },

    resetToken : String,

    /* FOR STUDENT ONLY */
    rollNumber : {
        type : String,
    },
    batch : {
        type : mongoose.Schema.ObjectId,
        ref : "Batch"
    },
    departement : {
        type : mongoose.Schema.ObjectId,
        ref : "Departement"
    },
    imagePath : String,

},{timestamps:true});


const UserModel = mongoose.model("User",userSchema);

export default UserModel;