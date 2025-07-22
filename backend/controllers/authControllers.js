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

class AuthController {
  async login(req, res, next) {
    const { email, password } = req.body;
    /* REQUEST VALIDATION */
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    /* CHECK USER EXIST OR NOT */
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
      next(error);
    }
    /* COMPARE PASSWORD WITH STORED HASHED PASSWORD */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(ErrorHandlerService.wrongCredentials("Invalid password."));
    }

    /* GENERATE TOKENS  */
    const { accessToken, refreshToken } = await tokenService.genrateTokens({
      _id: user._id,
      role: user.role,
    });

    /* SAVE REFRESH TOKEN INTO DB OR UPDATE PREVIOUS REFRESH TOKEN OF USER */
    try {
      const isExist = await tokenService.findRefreshToken({ user: user._id });
      if (isExist) {
        /* IF ALREADY EXIST TOKEN INTO DB THEN UPDATE TOKEN */
        await tokenService.updateRefreshToken(
          { user: user._id },
          { token: refreshToken }
        );
      } else {
        /* IF NOT THEN SIMPLY SAVED IT INTO DB */
        await tokenService.saveRefreshToken({
          user: user._id,
          token: refreshToken,
        });
      }
    } catch (error) {
      return next(error);
    }

    /* SET COOKIES  */
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    return res.status(200).json({ isAuth: true, user: user });
  }

  async refreshTokens(req, res, next) {
    // GET REFRESH TOKEN FROM COOKIES
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // VERIFY REFRESH TOKEN
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      return next(ErrorHandlerService.unAuthorized());
    }

    try {
      // CHECK REFRESH TOKEN IS IN DB
      const token = await tokenService.findRefreshToken({
        user: userData._id,
        token: refreshTokenFromCookie,
      });
      if (!token) {
        return next(ErrorHandlerService.unAuthorized("No token found !"));
      }

      // ALSO CHECK USER EXIST
      const userExist = await UserModel.findOne({ _id: userData._id })
        .populate("batch")
        .populate("departement");
      if (!userExist) {
        return next(ErrorHandlerService.unAuthorized("No user found!"));
      }

      // GENRATE NEW REFRESH TOKEN
      const { refreshToken, accessToken } = await tokenService.genrateTokens({
        _id: userData._id,
        role: userData.role,
      });
      // UPDATE REFRESH TOKEN IN DB
      await tokenService.updateRefreshToken(
        { user: userData._id },
        { token: refreshToken }
      );
      // SET NEW COOKIES
      res.cookie("accessToken", accessToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
      });
      // retrun response
      return res.status(200).json({
        user: userExist,
        isAuth: true,
      });
    } catch (error) {
      next(error);
    }
  }

  /* AUTHENTICATED USER ONLY */
  async changePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;
    /* REQUEST VALIDATION */
    if (!currentPassword || !newPassword) {
      return next(ErrorHandlerService.validationError());
    }

    try {
      /* CHECK USER EXIST OR NOT ? */
      const user = await UserModel.findOne({ _id: req.userData._id });
      if (!user) {
        return next(ErrorHandlerService.notFound());
      }
      /* CONFIRM CURRENT PASSWORD */
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(
          ErrorHandlerService.wrongCredentials("Current password is wrong!")
        );
      }
      /* HASHED NEW PASSWORD BEFORE SAVED INTO DB */
      const hashedPassowrd = await bcrypt.hash(newPassword, 10);
      // UPDAT PASSWORD
      await UserModel.findByIdAndUpdate(user._id, { password: hashedPassowrd });

      return res.status(200).json({ msg: "Password Changed Successfully !" });
    } catch (error) {
      next(error);
    }
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;
    /* VALIDATE REQUEST */
    const { error } = forgetPasswordValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      /* CHECK EMAIL IS VALID AND USER EXIST ? */
      const user = await UserModel.findOne({ email });
      if (!user) {
        return next(ErrorHandlerService.notFound("Email does not exist"));
      }
      /* GENRATE PASSWORD RESET TOKEN */
      const resetToken = await tokenService.genratePasswordResetToke({
        _id: user._id,
      });

      /* STORE PASSWORD RESET TOKEN INTO DB */
      user.resetToken = resetToken;
      await user.save();

      // send email
      // console.log(`Email Send ! Your password reset link is ${resetToken}`);
      await sendMail({
        to: user.email,
        from: "academicaffairs688@gmail.com",
        subject: "IIITBH BOOKHIVE  Password Reset Link",
        text: `Hello ${user.name} ! Your password reset link is  http://localhost:5173/new-password/${resetToken}/, Click on that link in order to change password`,
      });
      return res.status(200).json({ msg: "Email send...." });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    const { newPassword, token } = req.body;
    /* REQUEST VALIDATION  */
    if (!newPassword || !token) {
      return next(ErrorHandlerService.validationError());
    }
    /* CHECK TOKE IS VALID OR NOT */
    let userData;
    try {
      userData = await tokenService.verifyPasswordResetToken(token);
    } catch (error) {
      return next(
        ErrorHandlerService.badRequest("Password reset token expire !")
      );
    }

    try {
      /* VALIDATE USER INTO DB */
      const user = await UserModel.findOne({
        _id: userData._id,
        resetToken: token,
      });

      if (!user) {
        return next(ErrorHandlerService.badRequest("User Not Found  !"));
      }

      /* HASHED PASSWORD BEFORE SAVE INTO DB */
      const hashedPassowrd = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassowrd;
      user.resetToken = undefined;

      await user.save();
      return res.status(200).json({ msg: "Password reset successfully !" });
    } catch (error) {
      next(error);
    }
  }

  /* AUTHENTICATED USER ONLY */
  async logout(req, res, next) {
    // GET REFRESH TOKEN FROM COOKIES
    const { refreshToken } = req.cookies;
    // REMOVE REFRESH TOKEN
    try {
      await tokenService.removeRefreshToken({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    // REMOVE COOKIES
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.json({
      user: null,
      isAuth: false,
    });
  }

  /* AUTHENTICATED USER ONLY */
  async updateProfileImage(req, res, next) {
    const { avatar } = req.body;
    if (!avatar) {
      return next(ErrorHandlerService.validationError("Avatar Required !"));
    }
    try {
      // Image Base64
      const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

      const jimResp = await Jimp.read(buffer);

      jimResp.resize(250, Jimp.AUTO).write(`${ROOT_PATH}/uploads/${imagePath}`);

      /* UPDATE IMAGE PATH OF USER */

      const user = await UserModel.findById(req.userData._id);
      if (!user) {
        return next(ErrorHandlerService.notFound("User not found !"));
      }
      if (user.imagePath) {
        // Check previous image if have then delete it....
        deleteFile(`${user.imagePath}`);
      }
      /* update image */
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
