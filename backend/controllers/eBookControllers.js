import EBookModel from "../models/ebook-model.js";
import {
  handleMultipartData,
  deleteFile,
  ErrorHandlerService,
  paginationService,
} from "../services/index.js";
import { eBookValidationSchema } from "../services/validation-service.js";
import { ROOT_PATH } from "../server.js";
import csv from "fast-csv";
import fs from "fs";
import { BASE_URL } from "../config/index.js";

class EBookController {
  async createEBook(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(err);
      }
      const imagePath = req.files?.["image"][0]?.path;
      const pdfPath = req.files?.["pdf"][0]?.path;

      // console.log(imagePath, pdfPath);

      /* VALIDATE REQUEST */
      const { error } = eBookValidationSchema.validate(req.body);
      if (error) {
        /* DELETE IMAGE AND PDF BECAUSE VALIDATION FAIL */
        try {
          deleteFile(imagePath);
          deleteFile(pdfPath);
        } catch (error) {
          return next(error);
        }
        return next(error);
      }

      try {
        const isExist = await EBookModel.findOne({ ISBN: req.body.ISBN });
        if (isExist) {
          /* DELETE IMAGE AND PDF BECAUSE VALIDATION FAIL */
          deleteFile(imagePath);
          deleteFile(pdfPath);
          return next(ErrorHandlerService.alreadyExist("ISBN already exists"));
        }
        const document = new EBookModel({ ...req.body, imagePath, pdfPath });
        await document.save();

        return res.status(201).json(document);
      } catch (error) {
        next(error);
      }
    });
  }

  async getEBooks(req, res, next) {
    /* PAGINATION */
    const { page, limit, skip } = paginationService(req);
    /* FILTERING */
    const { qISBN = "", qTitle = "", qCategory } = req.query;

    const regexQueryISBN = new RegExp(qISBN, "i");
    const regexQueryTitle = new RegExp(qTitle, "i");
    const filter = [
      { ISBN: { $regex: regexQueryISBN } },
      { title: { $regex: regexQueryTitle } },
      { isDeleted: false },
    ];
    if (qCategory) {
      filter.push({ category: qCategory });
    }

    try {
      const [books, totalRecords] = await Promise.all([
        EBookModel.find({ $and: filter }, "-__v")
          .sort({ updatedAt: -1 })
          .populate("category", "-__v")
          .skip(skip)
          .limit(limit)
          .exec(),
        EBookModel.countDocuments({ $and: filter }).exec(),
      ]);
      const totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ books, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getEBook(req, res, next) {
    const { _id } = req.params;
    try {
      const document = await EBookModel.findById(_id, "-__v")
        .populate("category")
        .populate({
          path: "reviews.user",
          select: "name",
        });
      if (!document) {
        return next(ErrorHandlerService.notFound());
      }
      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  }

  async updateEBook(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(err);
      }
      const imagePath = req.files["image"]?.[0]?.path;
      const pdfPath = req.files["pdf"]?.[0]?.path;
      const { _id } = req.params;
      const { error } = eBookValidationSchema.validate(req.body);
      if (error) {
        /*CHECK IMAGE AND PDF UPLOAD? DELETE UPLOADED IMAGE AND PDF */
        try {
          imagePath && deleteFile(imagePath);
          pdfPath && deleteFile(pdfPath);
        } catch (error) {
          next(error);
        }
        return next(error);
      }
      /* UPDATE */
      try {
        const document = await EBookModel.findByIdAndUpdate(_id, req.body);
        /* CHECK NEW IMAGE IS UPLOADED THEN REMOVE OLD AND ADD NEW ONE */
        if (imagePath) {
          const oldImage = document.imagePath;
          if (oldImage) {
            deleteFile(oldImage);
          }
          document.imagePath = imagePath;
        }

        if (pdfPath) {
          const oldPdf = document.pdfPath;
          if (oldPdf) {
            deleteFile(oldPdf);
          }
          document.pdfPath = pdfPath;
        }
        await document.save();
        return res.status(201).json({ msg: "EBook updated successfully" });
      } catch (error) {
        next(error);
      }
    });
  }

  async deleteEBook(req, res, next) {
    const { _id } = req.params;
    try {
      const document = await EBookModel.findByIdAndDelete(_id);
      if (!document) {
        return next(ErrorHandlerService.notFound("EBook Not Found"));
      }
      deleteFile(document.imagePath);
      deleteFile(document.pdfPath);
      return res.status(204).json({ message: "EBook Deleted Successfull" });
    } catch (error) {
      next(error);
    }
  }

  async exportEBooks(req, res, next) {
    try {
      const data = await EBookModel.find().populate("category");
      if (data.length === 0) {
        return next(ErrorHandlerService.notFound("Books not found"));
      }

      const csvStream = csv.format({ headers: true });
      const filePath = `${ROOT_PATH}/public/files/export/ebooks.csv`;
      const writablestream = fs.createWriteStream(filePath);

      csvStream.pipe(writablestream);

      writablestream.on("finish", function () {
        res.json({
          downloadUrl: `${BASE_URL}/public/files/export/ebooks.csv`,
        });
      });

      if (data.length > 0) {
        data.map((i, index) => {
          csvStream.write({
            SNo: index + 1,
            ISBN: i.ISBN || "",
            "Book Title": i.title || "-",
            "Book Author": i.author || "-",
            "Book Category": i.category.name || "-",
            Edition: i.edition || "-",
            Publisher: i.publisher || "-",
            "Image URL": i.imagePath || "-",
            "PDF URL": i.pdfPath || "-",
          });
        });
      }
      csvStream.end();
      writablestream.end();
    } catch (error) {
      next(error);
    }
  }

  async readEBook(req, res, next) {}
}

export default new EBookController();
