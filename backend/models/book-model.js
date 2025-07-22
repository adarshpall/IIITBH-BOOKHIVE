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


const bookSchema = new mongoose.Schema({
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
    almirah:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Almirah',
        required : true
    },
    shelf : {
        type : String,
        required : false
    },
    imagePath : {
        type : String,
        required : false
    },
    status : {
        type : String,
        enum : ["Available","Reserved","Issued","Lost"],
        default : "Available"
    },
    isDeleted : {
        type : Boolean,
        default : false
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
    
},{timestamps:true});

const BookModel = mongoose.model("Book",bookSchema);

export default BookModel;