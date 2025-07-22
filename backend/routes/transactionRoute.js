import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
import transactionControllers from "../controllers/transactionControllers.js";


const transactionRouter = Router();

/* END POINTS */
/* ADMIN ENDPOINTs */
transactionRouter.post("/issue-book",authMiddleware,adminMiddleware,transactionControllers.issuedBook);
transactionRouter.get("/user-info",authMiddleware,adminMiddleware,transactionControllers.userInfo);
transactionRouter.get("/book-info",authMiddleware,adminMiddleware,transactionControllers.bookInfo);
transactionRouter.get("/admin-dashboard-stats",authMiddleware,adminMiddleware,transactionControllers.adminDashboardStats);

transactionRouter.post("/return-book",authMiddleware,adminMiddleware,transactionControllers.returnBook);
transactionRouter.post("/pay-fine",authMiddleware,adminMiddleware,transactionControllers.payFine);
transactionRouter.get("/reserved-books",authMiddleware,adminMiddleware,transactionControllers.getReservedBooks);
transactionRouter.get("/issued-books",authMiddleware,adminMiddleware,transactionControllers.getIssuedBooks);
transactionRouter.get("/returned-books",authMiddleware,adminMiddleware,transactionControllers.getReturnedBooks);

transactionRouter.get("/renew-books",authMiddleware,adminMiddleware,transactionControllers.getRenewRequests);
transactionRouter.post("/handle-renew-request",authMiddleware,adminMiddleware,transactionControllers.hanldeRenewRequest);

/* FOR TEACHERS AND STUDENT */
transactionRouter.get("/user-dashboard-stats",authMiddleware,transactionControllers.userDashboardStats);
transactionRouter.post("/reserved-book",authMiddleware,transactionControllers.reservedBook);
transactionRouter.get("/reserved-books-user",authMiddleware,transactionControllers.getReservedBooksByUser);
transactionRouter.get("/returned-books-user",authMiddleware,transactionControllers.getReturnedBooksByUser);
transactionRouter.get("/borrowed-books-user",authMiddleware,transactionControllers.getBorrowedBooksByUser);
transactionRouter.get("/unreserved-book/:_id",authMiddleware,transactionControllers.unReservedBook);
transactionRouter.post("/renew-book",authMiddleware,transactionControllers.renewRequest);


export default transactionRouter;