import UserModel from "../models/user-model.js";
import {
  ErrorHandlerService,
  generateRandomPassword,
  paginationService,
  sendMail,
} from "../services/index.js";
import { studentValidationSchema } from "../services/validation-service.js";
import bcrypt from "bcrypt";

import csv from "fast-csv";
import fs from "fs";
import { ROOT_PATH } from "../server.js";
import { BASE_URL } from "../config/index.js";
import DepartementModel from "../models/departement-model.js";
import BatchModel from "../models/batch-model.js";

class StudentController {
  async createStudent(req, res, next) {
    /* VALIDATE REQUEST */
    const { error } = studentValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      /* CHECK EMAIL OR ROLL NUMBER IS ALREADY EXIST (SHOULD BE UNIQUE) */
      const isEmailExist = await UserModel.findOne({ email: req.body.email });
      if (isEmailExist) {
        return next(
          ErrorHandlerService.alreadyExist("Email is already taken !")
        );
      }
      const isRollNumberExist = await UserModel.findOne({
        rollNumber: req.body.rollNumber,
      });
      if (isRollNumberExist) {
        return next(
          ErrorHandlerService.alreadyExist("Roll number is already exist")
        );
      }

      /* GENRATE RANDOM PASSWORD */
      const password = generateRandomPassword();
      /* HASHED PASSWORD */
      const hashedPassword = await bcrypt.hash(password, 10);
      const student = new UserModel({ ...req.body, password: hashedPassword });
      await student.save();

      res.status(200).json({ student });
      /* SEND WELCOME MAIL TO TEACHER AND ASK TO CHANGE THEIR PASSWORD */
      await sendMail({
        to: req.body.email,
        subject: `Welcome to IIITBH Library Managment System - Password Reset Required`,
        text: `Dear ${req.body.name},
                    Welcome to the IIITBH BOOKHIVE! Your account has been created by our admin.
                    Login Credentials:
                    Username/Email: ${req.body.email}
                    Default Password: ${password}
                    You can change your password by login into the system by using above credentials.
                    Thank you for using IIITBH BOOKHIVE .
                    `,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getStudents(req, res, next) {
    const { page, limit, skip } = paginationService(req);
    let totalPages;
    /* SEARCH QUERY */
    const regexQueryEmail = new RegExp(req.query.qEmail || "", "i");
    const regexQueryName = new RegExp(req.query.qName || "", "i");
    const regexQueryRollNumber = new RegExp(req.query.qRollNumber || "", "i");
    const filter = [
      { role: "Student" },
      { name: { $regex: regexQueryName } },
      { email: { $regex: regexQueryEmail } },
      { rollNumber: { $regex: regexQueryRollNumber } },
    ];

    try {
      const [students, totalRecords, batches, departements] = await Promise.all(
        [
          UserModel.find({ $and: filter }, "-__v -password")
            .sort({ createdAt: -1 })
            .populate("departement", "-__v -hod")
            .populate("batch", "-__v")
            .skip(skip)
            .limit(limit)
            .exec(),
          UserModel.countDocuments({ $and: filter }).exec(),
          BatchModel.find(),
          DepartementModel.find(),
        ]
      );
      totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({
          students,
          page,
          limit,
          totalRecords,
          totalPages,
          batches,
          departements,
        });
    } catch (error) {
      next(error);
    }
  }

  async getStudent(req, res, next) {
    const { _id } = req.params;
    try {
      const document = await UserModel.findById(_id, "-__v -password")
        .populate("departement", "-__v -hod")
        .populate("batch", "-__v");
      if (!document) {
        return next(ErrorHandlerService.notFound("Student not found"));
      }
      return res.status(200).json({ student: document });
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req, res, next) {
    const { _id } = req.params;
    try {
      /* VALIDATE REQEST */
      const { error } = studentValidationSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      const document = await UserModel.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      if (!document) {
        return next(ErrorHandlerService.notFound("Student not found"));
      }

      return res.status(200).json({ student: document });
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(req, res, next) {
    const { _id } = req.params;
    try {
      const document = await UserModel.findByIdAndDelete(_id);
      if (!document) {
        return next(ErrorHandlerService.notFound("Student Not Found"));
      }
      res.status(204).json({ student: document });
    } catch (error) {
      next(error);
    }
  }

  async exportStudents(req, res, next) {
    try {
      const data = await UserModel.find({ role: "Student" })
        .populate("departement")
        .populate("batch");
      if (data.length === 0) {
        return next(ErrorHandlerService.notFound("Students not found"));
      }

      const csvStream = csv.format({ headers: true });
      const filePath = `${ROOT_PATH}/public/files/export/students.csv`;
      const writablestream = fs.createWriteStream(filePath);
      csvStream.pipe(writablestream);
      writablestream.on("finish", function () {
        res.json({
          downloadUrl: `${BASE_URL}/public/files/export/students.csv`,
        });
      });

      if (data.length > 0) {
        data.map((i, index) => {
          csvStream.write({
            SNo: index + 1,
            Name: i.name || "-",
            "Father Name": i.fatherName || "-",
            "Roll Number": i.rollNumber || "-",
            Email: i.email || "-",
            "Departement Name": i.departement.name || "-",
            Batch: i.batch.name,
            "Account Status": i.accountStatus,
          });
        });
      }
      csvStream.end();
      writablestream.end();
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();
