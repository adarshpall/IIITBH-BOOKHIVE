import ClearanceModel from "../models/clearance-form-model.js";
import UserModel from "../models/user-model.js";
import { ErrorHandlerService, paginationService } from "../services/index.js";
import generateClearanceForm from "../services/clerance-form-pdf-genrator.js";

class ClearanceController {
  async submitForm(req, res, next) {
    /* 1- AUTHENTICATED USER ONLY ALLOW */
    /* 2- VALIDATE REQUEST */
    /* 3- CLEARANCE REQUESTS 
        IF REQUEST ALREADY HAVE THEN CHECK STATUS OF REQUESTS
            i) IF IT PENDING THEN DON't Allow to submit other request
            ii) IF IT IS APPROVED THEN DON"T 
            ii9) IF IT IS REJECTED THEN SENDS THIS TO LIBRARIAAN

        IF NOT HAVE REQUEST ALREADY THEN
            SAVE IT INTO DB
            and SENDS TO LIBRARAIN

        */
    const { type, additionalInformation } = req.body;
    if (!type) {
      return next(
        ErrorHandlerService.validationError("Clearance Type is required !")
      );
    }
    try {
      /* CHECK ALREADY HAVE REQUESTS THEN GET LAST ONE REQUEST.... */
      console.log(req.userData._id);
      const alreadyExistRequest = await ClearanceModel.findOne({
        user: req.userData._id,
      })
        .sort({ createdAt: -1 })
        .limit(-1);
      console.log(alreadyExistRequest);
      if (alreadyExistRequest) {
        if (alreadyExistRequest.status === "Approved") {
          return next(
            ErrorHandlerService.badRequest("Your request is already approved !")
          );
        }
        if (alreadyExistRequest.status === "Pending") {
          return next(
            ErrorHandlerService.badRequest(
              "your previous request is pending already."
            )
          );
        }
      }
      /* SAVE REQUEST INTO DATABASE */
      const newRequest = new ClearanceModel({
        type,
        additionalInformation,
        user: req.userData._id,
      });
      await newRequest.save();

      /*TODO:  SEND REQUEST TO THE LIBRARIAN....... Optional(SEND EMAIL AS WELLL) */

      return res.status(201).json({
        message: "Request submitted successfully !",
      });
    } catch (error) {
      return next(error);
    }
  }
  

  async getClearanceRequestsByStudent(req, res, next) {
    try {
      const clearanceRequests = await ClearanceModel.find({
        user: req.userData._id,
      }).populate("user", "name");
      return res.status(200).json({ clearanceRequests });
    } catch (error) {
      next(error);
    }
  }

  async getClearanceRequests(req, res, next) {
    /* QUERY : 
        ROLE = "LIBRARIAN"," CLERK" ,"HOD"
        STATUS = "PENDING","APPROVED","REJECTED" ACCORDING TO ROLE
     */
    const { page, skip, limit } = paginationService(req);
    const { role, status } = req.query;
    console.log(req.query);
    if (!role || !status) {
      return next(ErrorHandlerService.badRequest("Please provide queries."));
    }

    let filter = {};
    // Modify the query based on the role
    if (role === "Clerk") {
      filter = {
        librarianApprovalStatus: "Approved", // Only show requests approved by librarian
        clerkApprovalStatus: status,
      };
    } else if (role === "HOD") {
      filter = {
        librarianApprovalStatus: "Approved",
        clerkApprovalStatus: "Approved",
        hodApprovalStatus: status,
      };
    } else {
      filter = {
        librarianApprovalStatus: status,
      };
    }

    try {
      const [clearanceRequests, totalRecords] = await Promise.all([
        ClearanceModel.find(filter, "-__v")
          .populate("user", "name email fatherName rollNumber")
          .skip(skip)
          .limit(limit)
          .exec(),
        ClearanceModel.countDocuments(filter).exec(),
      ]);
      const totalPages = Math.ceil(totalRecords / limit);
      return res
        .status(200)
        .json({ clearanceRequests, page, limit, totalRecords, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async handleClearanceRequest(req, res, next) {
    const { clearanceRequestID, status, reason, role } = req.body;

    // Validate request
    if (!clearanceRequestID || !status || !role) {
      return next(ErrorHandlerService.validationError());
    }

    try {
      // Get clearance request
      const clearanceRequest = await ClearanceModel.findById(
        clearanceRequestID
      );
      if (!clearanceRequest) {
        return next(ErrorHandlerService.notFound());
      }

      // Get student
      const student = await UserModel.findById(clearanceRequest.user);
      if (!student) {
        return next(ErrorHandlerService.notFound("Student Not Found !"));
      }

      // Handle request based on role
      switch (role) {
        case "Admin":
          if (status === "Approved") {
            // Disable student account
            student.accountStatus = "Disabled";
            await student.save();

            // Update clearance request status
            clearanceRequest.librarianApprovalStatus = "Approved";
            await clearanceRequest.save();

            // TODO: Send request to clerk
          } else {
            // Validate reason
            if (!reason) {
              return next(
                ErrorHandlerService.validationError(
                  "Please provide reason of rejection."
                )
              );
            }

            // Update clearance request status
            clearanceRequest.librarianApprovalStatus = "Rejected";
            clearanceRequest.status = "Rejected";
            await clearanceRequest.save();

            // Send email to student
          }
          break;
        case "Clerk":
          if (status === "Approved") {
            // Update clearance request status
            clearanceRequest.clerkApprovalStatus = "Approved";
            await clearanceRequest.save();

            // TODO: Send request to HOD
          } else {
            // Validate reason
            if (!reason) {
              return next(
                ErrorHandlerService.validationError(
                  "Please provide reason of rejection."
                )
              );
            }

            // Update clearance request status
            clearanceRequest.clerkApprovalStatus = "Rejected";
            clearanceRequest.status = "Rejected";
            await clearanceRequest.save();

            // Send email to student
          }
          break;
        case "HOD":
          if (status === "Approved") {
            // Update clearance request status
            clearanceRequest.hodApprovalStatus = "Approved";
            clearanceRequest.status = "Approved";
            
            /* CREATE PDF FORM  */
            const fileName = `${clearanceRequest._id}.pdf`;
            const data = {
                _id : clearanceRequest._id,
                studentName : student?.name,
                studentRollNumber  : student?.rollNumber
            };
            await generateClearanceForm(data,fileName);
           
            /* SAVE PATH INTO DATABASE */
            clearanceRequest.pdfLink = `documents/${fileName}`;
            await clearanceRequest.save();
            // TODO: Send email to student with link to download form
          } else {
            // Validate reason
            if (!reason) {
              return next(
                ErrorHandlerService.validationError(
                  "Please provide reason of rejection."
                )
              );
            }

            // Update clearance request status
            clearanceRequest.hodApprovalStatus = "Rejected";
            clearanceRequest.status = "Rejected";
            await clearanceRequest.save();

            // Send email to student
          }
          break;
        default:
          return next(ErrorHandlerService.validationError("Invalid role"));
      }

      // Send response
      return res
        .status(200)
        .json({ message: "Clearance request processed successfully." });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ClearanceController();
