import UserModel from "../models/user-model.js";
import {
  ErrorHandlerService,
  deleteFile,
  sendMail,
  tokenService,
} from "../services/index.js";
import Jimp from "jimp";
import {
  forgetPasswordValidationSchema,
  loginValidationSchema,
} from "../services/validation-service.js";
import bcrypt from "bcrypt";
import { ROOT_PATH } from "../server.js";


const cookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: "None", 
  path: "/",
};

class AuthController {
  async login(req, res, next) {
    const { email, password } = req.body;
    const { error } = loginValidationSchema.validate(req.body);
    if (error) return next(error);

    let user;
    try {
      user = await UserModel.findOne({ email })
        .populate("batch")
        .populate("departement");
      if (!user) {
        return next(
          ErrorHandlerService.wrongCredentials("User not exist of that email.")
        );
      }
    } catch (error) {
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(ErrorHandlerService.wrongCredentials("Invalid password."));
    }

    const { accessToken, refreshToken } = await tokenService.genrateTokens({
      _id: user._id,
      role: user.role,
    });

    try {
      const isExist = await tokenService.findRefreshToken({ user: user._id });
      if (isExist) {
        await tokenService.updateRefreshToken(
          { user: user._id },
          { token: refreshToken }
        );
      } else {
        await tokenService.saveRefreshToken({
          user: user._id,
          token: refreshToken,
        });
      }
    } catch (error) {
      return next(error);
    }

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({ isAuth: true, user });
  }

  async refreshTokens(req, res, next) {
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      return next(ErrorHandlerService.unAuthorized());
    }

    try {
      const token = await tokenService.findRefreshToken({
        user: userData._id,
        token: refreshTokenFromCookie,
      });
      if (!token) return next(ErrorHandlerService.unAuthorized("No token found !"));

      const userExist = await UserModel.findOne({ _id: userData._id })
        .populate("batch")
        .populate("departement");
      if (!userExist) {
        return next(ErrorHandlerService.unAuthorized("No user found!"));
      }

      const { refreshToken, accessToken } = await tokenService.genrateTokens({
        _id: userData._id,
        role: userData.role,
      });

      await tokenService.updateRefreshToken(
        { user: userData._id },
        { token: refreshToken }
      );

      
      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, 
      });
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, 
      });

      return res.status(200).json({ user: userExist, isAuth: true });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    const { refreshToken } = req.cookies;
    try {
      await tokenService.removeRefreshToken({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.json({ user: null, isAuth: false });
  }

  async changePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(ErrorHandlerService.validationError());
    }

    try {
      const user = await UserModel.findOne({ _id: req.userData._id });
      if (!user) return next(ErrorHandlerService.notFound());

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(
          ErrorHandlerService.wrongCredentials("Current password is wrong!")
        );
      }

      const hashedPassowrd = await bcrypt.hash(newPassword, 10);
      await UserModel.findByIdAndUpdate(user._id, { password: hashedPassowrd });

      return res.status(200).json({ msg: "Password Changed Successfully !" });
    } catch (error) {
      next(error);
    }
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;
    const { error } = forgetPasswordValidationSchema.validate(req.body);
    if (error) return next(error);

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return next(ErrorHandlerService.notFound("Email does not exist"));
      }

      const resetToken = await tokenService.genratePasswordResetToke({
        _id: user._id,
      });

      user.resetToken = resetToken;
      await user.save();

      await sendMail({
        to: user.email,
        from: "academicaffairs688@gmail.com",
        subject: "IIITBH BOOKHIVE Password Reset Link",
        text: `Hello ${user.name} ! Your password reset link is http://localhost:5173/new-password/${resetToken}/`,
      });

      return res.status(200).json({ msg: "Email send...." });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    const { newPassword, token } = req.body;
    if (!newPassword || !token) {
      return next(ErrorHandlerService.validationError());
    }

    let userData;
    try {
      userData = await tokenService.verifyPasswordResetToken(token);
    } catch (error) {
      return next(
        ErrorHandlerService.badRequest("Password reset token expire !")
      );
    }

    try {
      const user = await UserModel.findOne({
        _id: userData._id,
        resetToken: token,
      });

      if (!user) {
        return next(ErrorHandlerService.badRequest("User Not Found !"));
      }

      const hashedPassowrd = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassowrd;
      user.resetToken = undefined;

      await user.save();
      return res.status(200).json({ msg: "Password reset successfully !" });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileImage(req, res, next) {
    const { avatar } = req.body;
    if (!avatar) {
      return next(ErrorHandlerService.validationError("Avatar Required !"));
    }
    try {
      const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

      const jimResp = await Jimp.read(buffer);
      jimResp.resize(250, Jimp.AUTO).write(`${ROOT_PATH}/uploads/${imagePath}`);

      const user = await UserModel.findById(req.userData._id);
      if (!user) {
        return next(ErrorHandlerService.notFound("User not found !"));
      }
      if (user.imagePath) {
        deleteFile(`${user.imagePath}`);
      }
      user.imagePath = `uploads/${imagePath}`;
      await user.save();

      return res.status(200).json({ user, isAuth: true });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getUserDetails(req, res, next) {
    const userId = req.query.userId;
    try {
      const user = await UserModel.findOne({ _id: userId })
        .populate("batch")
        .populate("departement");
      if (!user) {
        return next(ErrorHandlerService.notFound("User Not Found"));
      }
      return res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
