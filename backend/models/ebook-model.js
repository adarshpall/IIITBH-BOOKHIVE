import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
      user : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'User',
         required : true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );


const eBookSchema = new mongoose.Schema({
    ISBN : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    author : {
        type : String,
        required : true
    },
    category:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    imagePath : {
        type : String,
        required : true
    },
    pdfPath:{
        type : String,
        required : true
    },
    publisher : String,
    description : String,
    edition : String,
    totalReviews: {
        type: Number,
        default: 0, 
    },
    rating: {
        type: Number,
        default: 0, 
    },
    reviews : [reviewSchema],
    tags : [String],
    isDeleted : {
        type  : Boolean,
        default : false,
    }
    
},{timestamps:true});

const EBookModel = mongoose.model("EBook",eBookSchema);

export default EBookModel;