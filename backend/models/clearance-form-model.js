import mongoose from "mongoose";

const clearanceSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required  : true,
    },
    type:{
        type : String,
        enum : ["Graduation","Transfer"]
    },
    librarianApprovalStatus:{
        type : String,
        enum : ["Pending","Approved","Rejected"],
        default : "Pending"
    },
    hodApprovalStatus:{
        type : String,
        enum : ["Pending","Approved","Rejected"],
        default : "Pending"
    },
    clerkApprovalStatus:{
        type : String,
        enum : ["Pending","Approved","Rejected"],
        default : "Pending"
    },

    status:{
        type : String,
        enum : ["Pending","Approved","Rejected"],
        default : "Pending"
    },

    rejectedReason : {
        type : String
    },

    additionalInformation:{
        type  : String,
    },
    
    pdfLink : {
        type : String
    }

},{timestamps:true});


const ClearanceModel = mongoose.model("Clearance",clearanceSchema);

export default ClearanceModel;