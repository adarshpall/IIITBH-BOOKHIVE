import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  bookCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: false,
  },
});

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
