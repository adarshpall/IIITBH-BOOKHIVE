import { ADMIN_MAIL } from "../config/index.js";
import BookModel from "../models/book-model.js";
import CategoryModel from "../models/category-model.js";
import ContactUsModel from "../models/contact-us-model.js";
import EBookModel from "../models/ebook-model.js";
import UserModel from "../models/user-model.js";
import sendMail from "../services/email-service.js";
import ErrorHandlerService from "../services/error-handler-service.js";
import { contactUsValidationSchema } from "../services/validation-service.js";

class GenralController {
  async contactUs(req, res, next) {
    const { name, email, message } = req.body;
    const { error } = contactUsValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      await ContactUsModel.create(req.body);
      /* SEND MAIL TO ADMIN */
      await sendMail({
        to: ADMIN_MAIL,
        from: email,
        subject: "New Contact Form Submission",
        text: `
        Sender Information : 
        Name : ${name}
        Email : ${email}

        Message Content : 
        ${message}
        `,
      });
      return res.status(200).json({ msg: "Message sent successfully !" });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await ContactUsModel.find({ status: "unread" });
      return res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }

  async handleMessages(req, res, next) {
    const { action, replyMessage, _id } = req.body;
    // console.log(req.body);
    try {
      const document = await ContactUsModel.findById(_id);
      if (!document) {
        return next(ErrorHandlerService.notFound());
      }
      if (action === "reply") {
        if (!replyMessage) {
          return next(
            ErrorHandlerService.validationError("Message is required.")
          );
        }
        /* SEND MAIL */
        await sendMail({
          to: document.email,
          from: ADMIN_MAIL,
          subject: "Reply from GGC LMS",
          text: `             
                Reply From Admin : ${replyMessage}
                `,
        });
      }
      document.status = "read";
      await document.save();
      return res.status(200).json({ message: "Processed successfully !" });
    } catch (error) {
      next(error);
    }
  }

  async getHomeData(req, res, next) {
    try {
      const [
        newBooks,
        popularBooks,
        totalBooks,
        totalEBooks,
        totalUsers,
        totalCategories,
      ] = await Promise.all([
        BookModel.find().sort({ createdAt: -1 }).limit(10),
        /* POPULAR BOOK : MINIMUM 10 REVIEWS AND SORT BY RATING */
        BookModel.find()
          .where("totalReviews")
          .gte(1) // 1 supponse
          .sort({ rating: -1 })
          .limit(8),
        BookModel.countDocuments({ isDeleted: false }),
        EBookModel.countDocuments(),
        UserModel.countDocuments(),
        CategoryModel.countDocuments(),
      ]);
      return res.status(200).json({
        newBooks,
        popularBooks,
        totalBooks,
        totalEBooks,
        totalUsers,
        totalCategories,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReview(req, res, next) {
    const { _id } = req.params;
    const { rating, comment } = req.body;
    const { bookType } = req.query;
    /* VALIDATE REQUEST */
    if (!rating || !comment) {
      return next(ErrorHandlerService.validationError());
    }
    try {
      let book;
      if (bookType === "ebook") {
        book = await EBookModel.findById(_id).populate("category").populate({
          path: "reviews.user",
          select: "name",
        });
      } else {
        book = await BookModel.findById(_id)
          .populate("category")
          .populate("almirah")
          .populate({
            path: "reviews.user",
            select: "name",
          });
      }

      if (!book) {
        return next(ErrorHandlerService.notFound("Book Not Found"));
      }
      // Check if the user has already reviewed this book
      /* find vs filter : find only return one first item or undefind if not find and it does not iterate complete arrary but in filter you can iterate complete arrary and if conditon match then returns into arrray */

      const existingReview = book.reviews.find((review) => {
        return review.user._id == req.userData?._id;
      });

      if (existingReview) {
        return next(
          ErrorHandlerService.badRequest("You have already reviewed this book")
        );
      }
      const newReview = {
        user: req.userData?._id,
        rating,
        comment,
      };

      book.reviews.push(newReview);

      book.totalReviews += 1;
      const totalRating = book.reviews.reduce(
        (accumulator, review) => accumulator + review.rating,
        0
      ); // initail value of accumalator is 0
      book.rating = parseFloat((totalRating / book.totalReviews).toFixed(2));

      await book.save();
      return res
        .status(201)
        .json({ message: "Review added successfully", book });
    } catch (error) {
      next(error);
    }
  }
}

export default new GenralController();
