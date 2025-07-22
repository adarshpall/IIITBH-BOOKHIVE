import {
  NUMBER_OF_BOOKS_ALLOWED_TO_HOD,
  NUMBER_OF_BOOKS_ALLOWED_TO_STUDENT,
  NUMBER_OF_BOOKS_ALLOWED_TO_TEACHER,
  NUMBER_OF_DAYS_OF_STUDENT,
  NUMBER_OF_DAYS_OF_TEACHER_OR_HOD,
  NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_HOD,
  NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_STUDENT,
  NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_TEACHER,
} from "../config/index.js";

import BookModel from "../models/book-model.js";
import EBookModel from "../models/ebook-model.js";
import {
  FineModel,
  ReservationModel,
  TransactionModel,
} from "../models/transaction-models.js";

import UserModel from "../models/user-model.js";
import {
  ErrorHandlerService,
  calculateFine,
  paginationService,
  sendMail,
} from "../services/index.js";
import {
  issuedBookSchema,
  renewBookSchema,
  renewHandleSchema,
} from "../services/validation-service.js";

class TransactionController {
  async adminDashboardStats(req, res, next) {
    try {
      const currentDate = new Date();
      const [
        numberOfBorrowedBooks,
        numberOfAvailableBooks,
        numberOfEBooks,
        numberOfReservedBooks,
        numberOfTotalBooks,
        last5ReturnedBooks,
        last5IssuedBooks,
      ] = await Promise.all([
        TransactionModel.countDocuments({
          isBorrowed: true,
        }),
        BookModel.countDocuments({ status: "Available", isDeleted: "false" }),
        EBookModel.countDocuments({}),
        ReservationModel.countDocuments({}),
        BookModel.countDocuments({ isDeleted: false }),
        TransactionModel.find({ isBorrowed: false })
          .sort({ returnedDate: -1 })
          .limit(5)
          .populate("user", "name")
          .populate("book", "title ISBN"),
        TransactionModel.find({ isBorrowed: true })
          .sort({ borrowDate: -1 })
          .limit(5)
          .populate("user", "name")
          .populate("book", "title ISBN"),
      ]);

      /* STATUS DISTRIBUTION  */
      const statusCounts = {
        Reserved: numberOfReservedBooks,
        Issued: numberOfBorrowedBooks,
        Available: numberOfAvailableBooks,
      };
      // console.log(statusCounts);

      /* NUMBER OF BOOKS PER MONTH IN CURRENT YEAR... */
      const last12MonthsData = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];

      /* INTIALIZED MONTH TO ZERO BY DEFAULT */
      for (let i = 0; i < 12; i++) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // Month is 0-based
        last12MonthsData[`${monthNames[month]} ${year}`] = 0;
        currentDate.setMonth(currentDate.getMonth() - 1);
      }

      // Fetch transactions for the last 12 months
      const transactions12 = await TransactionModel.find({
        borrowDate: {
          $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // Start of the current month
          $lt: new Date(), // Current date
        },
      }).exec();

      transactions12.forEach((transaction) => {
        const year = transaction.borrowDate.getFullYear();
        const month = transaction.borrowDate.getMonth();
        const key = `${monthNames[month]} ${year}`;
        last12MonthsData[key] = (last12MonthsData[key] || 0) + 1;
      });

      // console.log(last12MonthsData);
      console.log(statusCounts);

      return res.status(200).json({
        numberOfBorrowedBooks,
        numberOfReservedBooks,
        numberOfAvailableBooks,
        numberOfEBooks,
        numberOfTotalBooks,
        statusCounts,
        last12MonthsData,
        last5IssuedBooks,
        last5ReturnedBooks,
      });
    } catch (error) {
      next(error);
    }
  }
  /* FOR ADMIN */
  async issuedBook(req, res, next) {
    /* REQUEST VALIDATION */
    const { error } = issuedBookSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    /* CHECK USER IS VALID OR NOT */
    /* I VALIDATE LIMIT OF ISSUED BOOK BY SPECIFIC USER ON FRONTEND AND ALSO BOOK */
    try {
      const user = await UserModel.findById(req.body.userID);
      if (!user) {
        return next(ErrorHandlerService.notFound("User Not Found"));
      }
      const book = await BookModel.findById(req.body.bookID);
      if (!book) {
        return next(ErrorHandlerService.notFound("Book Not Found"));
      }

      /* CHECK BOOK STATUS IS ISSUED OR LOST */
      if (book.status === "Issued" || book.status === "Lost") {
        return next(
          ErrorHandlerService.badRequest(
            `${
              book.status === "Issued"
                ? "OOPS ! Book is already Issued"
                : "OOPS ! This book is lost!"
            }`
          )
        );
      }
      /* CHECK BOOK STATUS IS RESERVED . THEN CHECK IF SAME STUDENT WANT TO ISSUE BOOK THEN REMOVE BOOK FROM RESERVATION  */
      if (book.status === "Reserved") {
        const reservedBook = await ReservationModel.findOne({
          book: book._id,
        }).populate("user");
        // console.log(reservedBook);
        if (user.email === reservedBook?.user?.email) {
          // console.log("Same user reserved book");
          await reservedBook.deleteOne();
        } else {
          return next(
            ErrorHandlerService.badRequest("Book Reserved by someone !")
          );
        }
      }

      /* SET DUE DATE ACCORDING TO USER ROLE : STUDENT ALLOW 7 DAYS AND TEACHERS ALLOW 10 DAYS */
      const currentDate = new Date();
      const dueDate = new Date(currentDate);
      dueDate.setDate(
        currentDate.getDate() +
          (user.role === "Student"
            ? NUMBER_OF_DAYS_OF_STUDENT
            : NUMBER_OF_DAYS_OF_TEACHER_OR_HOD)
      );

      /* ISSUED BOOK */
      const transaction = new TransactionModel({
        user: user._id,
        book: book._id,
        ISBN: book.ISBN,
        userEmail: user.email,
        rollNumber: user?.rollNumber,
        dueDate,
      });
      await transaction.save();
      /* CHANGE STAUTUS OF BOOK  */
      book.status = "Issued";
      await book.save();
      return res.status(200).json({ msg: "Book Issued Successfully !" });
    } catch (error) {
      next(error);
    }
  }

  /* SEARCH USER AND ITS TRANSACTION RECORD AS WELL AS NUMBER OF  ISSUED BOOK */
  async userInfo(req, res, next) {
    /* SEARCH BY EMAIL OR ROLL NUMBER */
    const { qEmail, qRollNumber } = req.query;
    let user;
    try {
      if (qRollNumber) {
        user = await UserModel.findOne(
          { rollNumber: qRollNumber },
          "-__v -password -batch -departement"
        );
      }
      if (qEmail) {
        user = await UserModel.findOne(
          { email: qEmail },
          "-__v -password -batch -departement"
        );
      }
      if (!user) {
        return next(ErrorHandlerService.notFound("User Not Found"));
      }
      /* CHECK HOW MANY BOOK ALREADY BORROWED AND WHICH ONE */
      const borrowedBooks = await TransactionModel.find(
        {
          user: user._id,
          isBorrowed: true,
        },
        "book borrowDate"
      ).populate("book", "ISBN title ");
      /* NUMBER OF BOOK BORROWED */
      const numberOfBorrowedBooks = borrowedBooks.length;
      const maxBooksAllowed = {
        Student: NUMBER_OF_BOOKS_ALLOWED_TO_STUDENT,
        Teacher: NUMBER_OF_BOOKS_ALLOWED_TO_TEACHER,
        HOD: NUMBER_OF_BOOKS_ALLOWED_TO_HOD,
      };
      let hasExceededLimit;
      if (user.role in maxBooksAllowed) {
        hasExceededLimit = numberOfBorrowedBooks >= maxBooksAllowed[user.role];
      } else {
        return next(
          ErrorHandlerService.forbidden("Not Allowed to borrow book")
        );
      }

      return res.status(200).json({
        user,
        borrowedBooks,
        numberOfBorrowedBooks,
        hasExceededLimit,
        maxBooksAllowed: maxBooksAllowed[user.role],
      });
    } catch (error) {
      next(error);
    }
  }
  /* SEARCH BOOKS BY ISBN  */
  async bookInfo(req, res, next) {
    const { qISBN } = req.query;
    try {
      const book = await BookModel.findOne(
        { ISBN: qISBN },
        "ISBN status title author"
      );
      if (!book) {
        return next(ErrorHandlerService.notFound("Book Not Found"));
      }
      /* CHECK IF BOOK IS RESERVED */
      let reservedAlready;
      if (book.status === "Reserved") {
        reservedAlready = await ReservationModel.findOne({
          book: book._id,
        }).populate("user", "email");
      }

      return res.status(200).json({
        book,
        reservedAlready,
      });
    } catch (error) {
      return next(error);
    }
  }

  async returnBook(req, res, next) {
    /* VALIDATE REQUEST (MEANS VALIDATE TRANSCATION ID) */
    const { transactionID } = req.body;
    if (!transactionID) {
      return next(
        ErrorHandlerService.validationError("Transaction is required.")
      );
    }
    try {
      const transaction = await TransactionModel.findOne({
        _id: transactionID,
      });
      if (!transaction) {
        return next(ErrorHandlerService.notFound("Transaction not found"));
      }

      /* CHECK IF FINE IS NOT EQUAL TO ZERO OR FINE IS NOT PAID THEN SEND MESSAGE  TO PAID FINE FIRST */
      //  if(!transaction.isPaid){
      //     return next(ErrorHandlerService.badRequest("Please Pay Fine First"));
      //  }
      //    if(!transaction.fine === 0){
      //     return next(ErrorHandlerService.badRequest("Please Pay Fine First"));
      //  }

      /* Update TRANSACTION */
      transaction.isBorrowed = false;
      transaction.returnedDate = new Date();
      await transaction.save();
      /* ALSO CHANGED BOOK STATUS FROM ISSUED TO AVAILABE */
      await BookModel.findByIdAndUpdate(transaction.book, {
        status: "Available",
      });

      return res.status(200).json({ msg: "Book Returned Successfully !" });
    } catch (error) {
      return next(error);
    }
  }

  async payFine(req, res, next) {
    const { transactionID } = req.body;
    if (!transactionID) {
      return next(
        ErrorHandlerService.validationError("Transaction is required.")
      );
    }
    try {
      const transaction = await TransactionModel.findOne({
        _id: transactionID,
      });
      if (!transaction) {
        return next(ErrorHandlerService.notFound("Transaction not found"));
      }
      /* UPDATE FINE  */
      transaction.isPaid = true;
      await transaction.save();

      /* ALSO SAVE INTO DB */

      await FineModel.create({
        transaction: transactionID,
        fine: transaction.fine,
      });

      res.status(200).json({ msg: "Fine paid successfully." });
    } catch (error) {
      next(error);
    }
  }

  async getReservedBooks(req, res, next) {
    const { page, limit, skip } = paginationService(req);
    let totalPages;
    try {
      const books = await ReservationModel.find()
        .sort({ date: -1 })
        .populate("user", "name email")
        .populate("book", "ISBN title author")
        .skip(skip)
        .limit(limit);

      const totalRecords = await ReservationModel.countDocuments();
      totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ books, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getIssuedBooks(req, res, next) {
    const { page, limit, skip } = paginationService(req);
    const { rollNumber, email, ISBN } = req.query;
    const filter = {
      isBorrowed: true,
      ...(rollNumber !== "" && { rollNumber }),
      ...(email !== "" && { userEmail: email }),
      ...(ISBN !== "" && { ISBN }),
    };
    let totalPages;
    try {
      const transactions = await TransactionModel.find(
        filter,
        "-createdAt -updatedAt"
      )
        .populate("user", "name email")
        .populate("book", "ISBN title author")
        .skip(skip)
        .limit(limit);
      const totalRecords = await TransactionModel.countDocuments(filter);
      totalPages = Math.ceil(totalRecords / limit);

      /* CALCULATE FINE OF EACH TRANSACTION */
      const transactionsWithFine = await Promise.all(
        transactions.map(async (transaction) => {
          const { fine } = calculateFine(transaction.dueDate, new Date());

          // Update fine value in DB if it's greater than 0 and if it has changed
          if (fine > 0 && transaction.fine !== fine) {
            await TransactionModel.findByIdAndUpdate(transaction._id, {
              fine: fine,
            });
          }

          return { ...transaction.toObject(), fine };
        })
      );

      return res
        .status(200)
        .json({ transactionsWithFine, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getReturnedBooks(req, res, next) {
    const { page, limit, skip } = paginationService(req);
    let totalPages;
    try {
      const books = await TransactionModel.find({ isBorrowed: false })
        .populate("user", "name email")
        .populate("book", "ISBN title author")
        .skip(skip)
        .limit(limit);
      const totalRecords = await TransactionModel.countDocuments({
        isBorrowed: false,
      });
      totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ books, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  /* GET ALL PENDING REQUEST */
  async getRenewRequests(req, res, next) {
    try {
      const renewRequests = await TransactionModel.find({
        renewStatus: "Pending",
        isBorrowed: true,
      })
        .populate("user", "name email")
        .populate("book", "title");
      return res.status(200).json({ renewRequests });
    } catch (error) {
      next(error);
    }
  }

  /* REJECT OR ACCEPT RENEW REQUEST */
  async hanldeRenewRequest(req, res, next) {
    const { transactionID, renewalStatus } = req.body;
    /* VALIDATE */
    const { error } = renewHandleSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      /* GET TRANSACTION BY ID */
      const transaction = await TransactionModel.findById(transactionID)
        .populate("user")
        .populate("book"); // populate user and book because sends to mail
      if (!transaction) {
        return next(ErrorHandlerService.notFound("Transaction not found !"));
      }

      if (renewalStatus === "Accepted") {
        /* INCREASE DUE DATE */
        const currentDueDate = transaction.dueDate;
        const newDueDate = new Date(currentDueDate);
        newDueDate.setDate(newDueDate.getDate() + transaction.renewalDays);

        transaction.dueDate = newDueDate;
        transaction.renewStatus = "Accepted";
      } else {
        transaction.renewStatus = "Rejected";
      }

      await transaction.save();

      /* SENDING MAIL TO USE TO INFORM  */
      await sendMail({
        to: transaction.user.email,
        subject: "Renewal Request Accepted",
        text: `We hope this email finds you well. We wanted to inform you about the status of your recent renewal request for the book titled ${
          transaction.book.title
        }.
        ${
          renewalStatus === "Accepted"
            ? `Your renewal request has been accepted, and your new due date is ${transaction.dueDate}.`
            : `We regret to inform you that your renewal request has been rejected.`
        }

        Thank you for using our library services.

        Best regards,
        IIITBH BOOKHIVE Library Management System Admin
          `,
      });

      return res.status(200).json({ message: "Processed Successfully !" });
    } catch (error) {
      next(error);
    }
  }

  /* ####################### FOR STUDENTS AND TEACHERS  #####################*/

  async userDashboardStats(req, res, next) {
    try {
      const { _id: userID } = req.userData;
      const currentDate = new Date();
      const [
        numberOfBorrowedBooks,
        numberOfReturnedBooks,
        numberOfReservedBooks,
        numberOfOverDueBooks,
      ] = await Promise.all([
        TransactionModel.countDocuments({
          isBorrowed: true,
          user: userID,
        }),
        TransactionModel.countDocuments({
          isBorrowed: false,
          user: userID,
        }),
        ReservationModel.countDocuments({
          user: userID,
        }),
        TransactionModel.countDocuments({
          user: userID,
          dueDate: { $lt: currentDate },
          isBorrowed: true,
        }),
      ]);

      /* CATEGORIES DISTRIBUTION  */
      const transactions = await TransactionModel.find({ user: userID })
        .populate("user")
        .populate({
          path: "book",
          populate: {
            path: "category", // Populate the 'category' field of the 'book'
            model: "Category", // Replace with the actual model name for categories
          },
        })
        .exec();

      const categoryCounts = {};

      transactions.forEach((transaction) => {
        const book = transaction.book;
        if (!book) return;
        console.log(book);

        const category = book.category.name;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      console.log(categoryCounts);

      /* NUMBER OF BOOKS PER MONTH IN CURRENT YEAR... */
      const last12MonthsData = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];

      /* INTIALIZED MONTH TO ZERO BY DEFAULT */
      for (let i = 0; i < 12; i++) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // Month is 0-based
        last12MonthsData[`${monthNames[month]} ${year}`] = 0;
        currentDate.setMonth(currentDate.getMonth() - 1);
      }

      // Fetch transactions for the last 12 months
      const transactions12 = await TransactionModel.find({
        user: userID,
        borrowDate: {
          $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // Start of the current month
          $lt: new Date(), // Current date
        },
      }).exec();

      transactions12.forEach((transaction) => {
        const year = transaction.borrowDate.getFullYear();
        const month = transaction.borrowDate.getMonth();
        const key = `${monthNames[month]} ${year}`;
        last12MonthsData[key] = (last12MonthsData[key] || 0) + 1;
      });

      console.log(last12MonthsData);

      return res.status(200).json({
        numberOfBorrowedBooks,
        numberOfReservedBooks,
        numberOfReturnedBooks,
        numberOfOverDueBooks,
        categoryCounts,
        last12MonthsData,
      });
    } catch (error) {
      next(error);
    }
  }
  async reservedBook(req, res, next) {
    const { _id, role } = req.userData;
    const { ISBN } = req.body;
    if (!ISBN) {
      return next(ErrorHandlerService.validationError("ISBN is required."));
    }
    try {
      /* CHECK HOW MANY BOOKS STUDENTS ALREADY RESERVED */
      const roleLimits = {
        Student: NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_STUDENT,
        Teacher: NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_TEACHER,
        HOD: NUMBER_OF_RESERVED_BOOKS_ALLOW_TO_HOD,
      };
      const limit = roleLimits[role];
      if (limit === undefined) {
        return next(
          ErrorHandlerService.forbidden("Not allowed to reserve books")
        );
      }
      const numberOfReservedBooks = await ReservationModel.countDocuments({
        user: _id,
      });
      const hasExceededLimit = numberOfReservedBooks >= limit;
      if (hasExceededLimit) {
        return next(
          ErrorHandlerService.badRequest(
            `You already reserved ${numberOfReservedBooks} books and ${role} can only reserve ${limit}`
          )
        );
      }

      /* CHECK BOOK STATUS (ALREADY RESERVED OR ISSUED) */
      const book = await BookModel.findOne({ ISBN: ISBN })
        .populate("category")
        .populate("almirah")
        .populate({
          path: "reviews.user",
          select: "name",
        });
      if (!book) {
        return next(ErrorHandlerService.notFound("Book not found"));
      }
      if (book.status === "Reserved" || book.status === "Issued") {
        return next(
          ErrorHandlerService.forbidden(`Book already ${book.status}.`)
        );
      }

      /* RESERVED BOOK NOW */
      const reservedBook = new ReservationModel({ user: _id, book: book._id });
      await reservedBook.save();
      /* CHANGE STATUS OF BOOK */
      book.status = "Reserved";
      await book.save();

      return res
        .status(201)
        .json({ message: "Book Reserved successfully.", book });
    } catch (error) {
      next(error);
    }
  }

  async getReservedBooksByUser(req, res, next) {
    try {
      const reservedBooks = await ReservationModel.find({
        user: req.userData._id,
      }).populate("book", "title author ISBN publisher edition");
      const numberOfReservedBooks = reservedBooks.length;

      return res.status(200).json({ reservedBooks, numberOfReservedBooks });
    } catch (error) {
      next(error);
    }
  }

  async getBorrowedBooksByUser(req, res, next) {
    try {
      const borrowedBooks = await TransactionModel.find({
        user: req.userData._id,
        isBorrowed: true,
      }).populate("book", "title author ISBN publisher edition");
      const numberOfBorrowedBooks = borrowedBooks.length;

      return res.status(200).json({ borrowedBooks, numberOfBorrowedBooks });
    } catch (error) {
      next(error);
    }
  }

  async getReturnedBooksByUser(req, res, next) {
    try {
      const returnedBooks = await TransactionModel.find({
        user: req.userData._id,
        isBorrowed: false,
      })
        .sort({ returnedDate: -1 })
        .populate("book", "title author ISBN publisher edition returnedDate");

      return res.status(200).json({ returnedBooks });
    } catch (error) {
      next(error);
    }
  }

  async unReservedBook(req, res, next) {
    const { _id } = req.params;
    try {
      const reservationBook = await ReservationModel.findByIdAndDelete(_id);
      console.log(reservationBook);
      if (!reservationBook) {
        return next(ErrorHandlerService.notFound("Transaction not found !"));
      }
      /* CHANGE BOOK STATUS FROM RESERVED TO AVAILABLE */
      const book = await BookModel.findByIdAndUpdate(reservationBook.book, {
        status: "Available",
      });

      const reservedBooks = await ReservationModel.find({
        user: req.userData._id,
      }).populate("book", "title author ISBN publisher edition");

      return res
        .status(200)
        .json({ message: "Book UnReserved Successfully !", reservedBooks });
    } catch (error) {}
  }

  async renewRequest(req, res, next) {
    const { transactionID, renewalDays } = req.body;
    /* Validate renewalDays (between 1-7 days) */
    const { error } = renewBookSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      /* VALIDATE TRANSACTION */
      const transaction = await TransactionModel.findById(
        transactionID
      ).populate("book");
      if (!transaction) {
        return next(ErrorHandlerService.notFound("Transaction not found...."));
      }

      /*  Check if the transaction has already been renewed or processed  */
      if (
        transaction.renewStatus === "Pending" ||
        transaction.renewStatus === "Rejected" ||
        transaction.renewStatus === "Accepted"
      ) {
        return next(
          ErrorHandlerService.badRequest(
            `Your request is already ${transaction.renewStatus}`
          )
        );
      }

      /* Check if the transaction's due date has passed ....*/
      const currentDate = new Date();
      if (currentDate > transaction.dueDate) {
        return next(
          ErrorHandlerService.badRequest(
            "Cannot renew after the due date has passed"
          )
        );
      }

      /* Update the transaction with the renewal request */
      transaction.renewStatus = "Pending";
      transaction.renewalDays = renewalDays;

      await transaction.save();

      return res.status(200).json({
        message: "Your request has been submitted successfully !",
        transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();
