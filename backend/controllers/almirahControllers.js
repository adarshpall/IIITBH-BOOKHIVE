import AlmirahModel from "../models/almirah-model.js";
import { almirahValidationSchema } from "../services/validation-service.js";
import { ErrorHandlerService, exportToCSV, paginationService } from "../services/index.js";

class AlmirahController {
  async createAlmirah(req, res, next) {
    const { error } = almirahValidationSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      const isExist = await AlmirahModel.findOne({ number: req.body.number });
      if (isExist) {
        return next(ErrorHandlerService.alreadyExist());
      }
      const document = await AlmirahModel.create(req.body);
      return res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }
  async getAlmirahs(req, res, next) {
    const {page,limit,skip} = paginationService(req);
    /* SEARCH FILTER */
    const q = req.query.q || "";
    const regexQuery = new RegExp(q, "i");
    const filter = [
      { subject: { $regex: regexQuery } },
      { number: { $regex: regexQuery } },
    ];

    try {
        const [almirahs, totalRecords] = await Promise.all([
          AlmirahModel.find({$or:filter}).skip(skip).limit(limit).exec(),
          AlmirahModel.countDocuments({$or:filter}).exec(),
        ]);
        const totalPages = Math.ceil(totalRecords / limit);
        return res
          .status(200)
          .json({ almirahs, page, limit, totalRecords, totalPages });
      } catch (error) {
        next(error);
      }
  }
  async getAlmirah(req, res, next) {
    const { _id } = req.params;
    try {
      const almirah = await AlmirahModel.findById(_id);
      if (!almirah) {
        return next(ErrorHandlerService.notFound("Almirah not found"));
      }
      return res.status(200).json({ almirah });
    } catch (error) {
      next(error);
    }
  }
  
  async updateAlmirah(req, res, next) {
    const { _id } = req.params;
    try {
      /* VALIDATE REQUEST */
      const { error } = almirahValidationSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      const almirah = await AlmirahModel.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      if (!almirah) {
        return next(ErrorHandlerService.notFound("Batch not found"));
      }

      return res.status(200).json({ almirah });
    } catch (error) {
      next(error);
    }
  }

  async deleteAlmirah(req, res, next) {
    const { _id } = req.params;
    try {
      const almirah = await AlmirahModel.findByIdAndDelete(_id);
      if (!almirah) {
        return next(ErrorHandlerService.notFound("Almirah Not Found"));
      }
      res.status(204).json({ almirah });
    } catch (error) {
      next(error);
    }
  }

  async exportAlmirahs(req, res, next) {
    try {
        const data = await AlmirahModel.find();
        if (data.length === 0) {
          return next(ErrorHandlerService.notFound("Data not found"));
        }
        const columns = [
          { header: "Subject", key: "subject" },
          { header: "Almirah Number", key: "number" },
          { header: "Total Books", key: "bookCount" },
        ];
        const fileName = "almirahs.csv";
        exportToCSV(data, columns, fileName, res);
      } catch (error) {
          next(error);
      }
  }
}

export default new AlmirahController();
