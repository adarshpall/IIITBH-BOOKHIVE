import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token : {
        type : String,
        unique  : true,
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
},{timestamps : true});

const RefreshTokenModel = mongoose.model("RefreshToken",refreshTokenSchema);

export default RefreshTokenModel;