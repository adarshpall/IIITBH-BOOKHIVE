import mongoose from "mongoose";

const almirahSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  
  },
  subject:{
    type : String,
    required : true
  },
  bookCount: {
    type: Number,
    default : 0
  }
});

const AlmirahModel = mongoose.model("Almirah", almirahSchema);

export default AlmirahModel;
