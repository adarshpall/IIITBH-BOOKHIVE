import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  startingYear: {
    type: Number,
    required: true,
  },
  endingYear: {
    type: Number,
    required: true,
  }
});

const BatchModel = mongoose.model("Batch", batchSchema);

export default BatchModel;
