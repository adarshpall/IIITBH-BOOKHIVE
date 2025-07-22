import jsonwebtoken from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, FORGET_PASSWORD_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/index.js";
import RefreshTokenModel from "../models/refresh-token-model.js";

class TokenService {
    async genrateTokens(payload){
        const accessToken = jsonwebtoken.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:'5m'});
        const refreshToken = jsonwebtoken.sign(payload,REFRESH_TOKEN_SECRET,{expiresIn:'1y'});
        return {accessToken,refreshToken};
    }

    async findRefreshToken(filter){
        return await RefreshTokenModel.findOne(filter);
    }

    async saveRefreshToken(data){
        return await RefreshTokenModel.create(data);
    }

    async updateRefreshToken(filter,data){
        return await RefreshTokenModel.updateOne(filter,data);
    }

    async removeRefreshToken(filter){
        return await RefreshTokenModel.deleteOne(filter);
    }

    async verifyAccessToken(token){
        return  jsonwebtoken.verify(token,ACCESS_TOKEN_SECRET);
    }

    async verifyRefreshToken(token){
        return  jsonwebtoken.verify(token,REFRESH_TOKEN_SECRET);
    }

    async genratePasswordResetToke(payload){
        return jsonwebtoken.sign(payload,FORGET_PASSWORD_TOKEN_SECRET,{
            expiresIn : '4m'
        });
    }

    async verifyPasswordResetToken(token){
        return  jsonwebtoken.verify(token,FORGET_PASSWORD_TOKEN_SECRET);
    }
}

export default new TokenService();