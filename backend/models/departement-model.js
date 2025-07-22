import mongoose from "mongoose";

const departementSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    hod : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    }
});


const DepartementModel = mongoose.model("Departement",departementSchema);

export default DepartementModel;