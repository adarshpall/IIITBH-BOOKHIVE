import BatchModel from "../models/batch-model.js";
import {
  ErrorHandlerService,
  exportToCSV,
  paginationService,
} from "../services/index.js";
import { batchValidationSchema } from "../services/validation-service.js";

class BatchController {
  async createBatch(req, res, next) {
    try {
      /* REQUEST VALIDATION  */
      const { error } = batchValidationSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      /* CHECK BATCH NAME IS ALREADY EXIST  */
      const isExist = await BatchModel.findOne({ name: req.body.name });
      if (isExist) {
        return next(
          ErrorHandlerService.alreadyExist("Batch name already taken.")
        );
      }
      /* SAVE INTO DB */
      const batch = new BatchModel(req.body);
      await batch.save();

      /* RETURN RESPONSE */
      return res.status(200).json({ batch });
    } catch (error) {
      next(error);
    }
  }


  async getBatches(req, res, next) {
    /* PAGINATION */
    const { page, limit, skip } = paginationService(req);
    let  totalPages;
    /* FILTER */
    const q = req.query.q;
    const filter = q ? { name: { $regex: new RegExp(q, "i") } } : {};
    try {
      const [batches, totalRecords] = await Promise.all([
        BatchModel.find(filter).skip(skip).limit(limit).exec(),
        BatchModel.countDocuments(filter).exec(),
      ]);
      totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ batches, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getBatch(req, res, next) {
    const { _id } = req.params;
    try {
      const batch = await BatchModel.findById(_id);
      if (!batch) {
        return next(ErrorHandlerService.notFound("Batch not found"));
      }
      return res.status(200).json({ batch });
    } catch (error) {
      next(error);
    }
  }



  async updateBatch(req, res, next) {
    const { _id } = req.params;
    try {
      /* VALIDATE REQEST */
      const { error } = batchValidationSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      const batch = await BatchModel.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      if (!batch) {
        return next(ErrorHandlerService.notFound("Batch not found"));
      }

      return res.status(200).json({ batch });
    } catch (error) {
      next(error);
    }
  }

  async deleteBatch(req, res, next) {
    const { _id } = req.params;
    try {
      const batch = await BatchModel.findByIdAndDelete(_id);
      if (!batch) {
        return next(ErrorHandlerService.notFound("Batch Not Found"));
      }
      res.status(204).json({ batch });
    } catch (error) {
      next(error);
    }
  }

  async exportBatches(req, res, next) {
    try {
      const data = await BatchModel.find();
      if (data.length === 0) {
        return next(ErrorHandlerService.notFound("Data not found"));
      }
      const columns = [
        { header: "Name", key: "name" },
        { header: "Starting Year", key: "startingYear" },
        { header: "Ending Year", key: "endingYear" },
      ];
      const fileName = "batches.csv";
      exportToCSV(data, columns, fileName, res);
    } catch (error) {
        next(error);
    }
  }
}

export default new BatchController();
