import DepartementModel from "../models/departement-model.js";
import UserModel from "../models/user-model.js";
import { ErrorHandlerService, paginationService } from "../services/index.js";
import { departementValidationSchema } from "../services/validation-service.js";
import csv from "fast-csv";
import fs from "fs";
import { ROOT_PATH } from "../server.js";
import { BASE_URL } from "../config/index.js";

class DepartementController {
  async createDepartement(req, res, next) {
    const { name, hod } = req.body;
    /* VALIDATE REQUEST */
    const { error } = departementValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      /* CHECK DEPARTEMENT NAME ALREADY EXIST */
      const isExist = await DepartementModel.findOne({ name });
      if (isExist) {
        return next(
          ErrorHandlerService.alreadyExist(
            "Departement of that name is already exist !"
          )
        );
      }
      /* CHECK VALID TEACHER WHO WANT TO BE A HOD (HOD ID) */
      const teacher = await UserModel.findOne({ _id: hod, role: "Teacher" });
      if (!teacher) {
        return next(ErrorHandlerService.badRequest("Invalid Teacher !"));
      }

      /* SAVE INTO DB */
      const document = await DepartementModel.create({ name, hod });
      /* CHANGE TEACER STATUS INTO HOD */
      teacher.role = "HOD";
      await teacher.save();
      return res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  async getDepartements(req, res, next) {
    const { page, limit, skip } = paginationService(req);
    let totalPages;
    const q = req.query.q;
    const filter = q ? { name: { $regex: new RegExp(q, "i") } } : {};

    try {
      const [departements, totalRecords,teachers] = await Promise.all([
        DepartementModel.find(filter, "-__v")
          .populate("hod", "-__v -password")
          .skip(skip)
          .limit(limit)
          .exec(),
        DepartementModel.countDocuments(filter).exec(),
        UserModel.find({role:"Teacher"},"name _id")
      ]);
      totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ departements, page, limit, totalRecords, totalPages,teachers });
    } catch (error) {
      next(error);
    }
  }
  

  async getDepartement(req, res, next) {
    const { _id } = req.params;
    try {
      const document = await DepartementModel.findById(_id, "-__v").populate(
        "hod",
        "-__v -password"
      );
      if (!document) {
        return next(ErrorHandlerService.notFound("Departement not found"));
      }
      return res.status(200).json({ departement: document });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartement(req, res, next) {
    const { _id } = req.params;
    /* HOD CHANGE */
    const { hod } = req.body;
    /* VALIDATE REQUEST */
    if (!hod) {
      return next(ErrorHandlerService.validationError());
    }

    try {
      /* CHECK DEPARTEMENT EXIST OR NOT */
      const document = await DepartementModel.findById(_id);
      if (!document) {
        return next(ErrorHandlerService.notFound());
      }
      /* CHECK TEACHER EXIST WHO WILL BE THE NEW HOD */
      const teacher = await UserModel.findOne({ _id: hod, role: "Teacher" });
      if (!teacher) {
        return next(ErrorHandlerService.badRequest("Invalid Teacher !"));
      }
      /* CHANGE PREVOIOUS HOD STATUS INTO TEACHER */
      const previousHOD = await UserModel.findOne({ _id: document.hod });
      previousHOD.role = "Teacher";
      await previousHOD.save();
      /* CHANGE STATUS OF NEW TEACHER INTO HOD */
      teacher.role = "HOD";
      await teacher.save();
      /* CHANGE HOD OF DEPARTEMENT */
      document.hod = hod;
      document.save();

      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartement(req, res, next) {
    const { _id } = req.params;
    try {
      const departement = await DepartementModel.findByIdAndDelete(_id);
      if (!departement) {
        return next(ErrorHandlerService.notFound("Departement Not Found"));
      }
      res.status(204).json({ departement });
    } catch (error) {
      next(error);
    }
  }

  async exportDepartements(req, res, next) {
    try {
      const data = await DepartementModel.find().populate("hod");
      if (data.length === 0) {
        return next(ErrorHandlerService.notFound("Departements not found"));
      }

      const csvStream = csv.format({ headers: true });
      const filePath = `${ROOT_PATH}/public/files/export/departements.csv`;
      const writablestream = fs.createWriteStream(filePath);

      csvStream.pipe(writablestream);

      writablestream.on("finish", function () {
        res.json({
          downloadUrl: `${BASE_URL}/public/files/export/departements.csv`,
        });
      });

      if (data.length > 0) {
        data.map((i, index) => {
          csvStream.write({
            SNo: index + 1,
            "Departement Name": i.name || "-",
            "HOD NAME": i.hod.name || "-",
            "HOD EMAIL": i.hod.email || "-",
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

export default new DepartementController();
