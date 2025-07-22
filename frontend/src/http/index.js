import axios from "axios";

// create instance of axios
export const BASE_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// debouncing
export const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// #############################  MAIN WEBSITE API REQUESTS  #########################

export const getHomePageData = () => api.get("/genral/home-data");
export const createReview = (_id, data, query) =>
  api.post(`/genral/books/${_id}/reviews?bookType=${query}`, data);

// ######################## AUTHENTICATION REQUESTS #################################
export const login = (data) => {
  return api.post("/auth/login", data);
};

export const profile = () => {
  return api.get("/auth/profile");
};

export const refreshTokens = () => {
  return api.get("/auth/refresh-tokens");
};

export const logout = () => {
  return api.get("/auth/logout");
};

export const forgetPassword = (data) => {
  return api.post("/auth/forget-password", data);
};
export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};

export const updateProfileImage = (data) => {
  return api.post("/auth/update-profile-image", data);
};

export const changePassword = (data) => {
  return api.post("/auth/change-password", data);
};

export const getUserDetails = (_id) => {
  return api.get(`/auth/user-details?userId=${_id}`);
};

// ######################## MANAGE TEACHERS REQUESTS #################################

export const getAllTeachers = async (qEmail, qName, page) =>
  await api.get(`/teachers?qEmail=${qEmail}&qName=${qName}&page=${page}`);
export const addNewTeacher = async (data) => api.post("/teachers", data);
export const deleteTeacher = async (_id) => api.delete(`/teachers/${_id}`);
export const updateTeacher = async (_id, data) =>
  api.put(`/teachers/${_id}`, data);
export const exportTeachers = async () => api.get(`/teachers/files/export`);
// ######################## MANAGE STUDENT REQUESTS #################################
export const getAllStudents = async (qEmail, qName, qRollNumber, page) =>
  await api.get(
    `/students?qEmail=${qEmail}&qName=${qName}&qRollNumber=${qRollNumber}&page=${page}`
  );
export const addNewStudent = async (data) => api.post("/students", data);
export const deleteStudent = async (_id) => api.delete(`/students/${_id}`);
export const updateStudent = async (_id, data) =>
  api.put(`/students/${_id}`, data);
export const exportStudents = async () => api.get(`/students/files/export`);
// ############################## Category End Points ##########################
export const addNewCategory = (data) => api.post("/categories/", data);
export const deleteCategory = (_id) => api.delete(`/categories/${_id}`);
export const updateCategory = (_id, data) =>
  api.put(`/categories/${_id}`, data);
export const exportCategories = () => api.get("/categories/files/export");
export const getAllCategories = (q, page) =>
  api.get(`/categories?q=${q}&page=${page}`);
// ################################ Almirah Add ##############################
export const addNewAlmirah = (data) => api.post("/almirahs/", data);
export const exportAlmirahs = () => api.get("/almirahs/files/export");
export const getAllAlmirahs = (q, page) =>
  api.get(`/almirahs?q=${q}&page=${page}`);
export const deleteAlmirah = (_id) => api.delete(`/almirahs/${_id}`);
export const updateAlmirah = (_id, data) => api.put(`/almirahs/${_id}`, data);
// ################################ Batch Add ##############################
export const addNewBatch = (data) => api.post("/batches/", data);
export const exportBatches = () => api.get("/batches/files/export");
export const getAllBatches = (q, page) =>
  api.get(`/batches?q=${q}&page=${page}`);
export const deleteBatches = (_id) => api.delete(`/batches/${_id}`);
export const updateBatch = (_id, data) => api.put(`/batches/${_id}`, data);
// ################################ Batch Add ##############################
export const addNewDepartement = (data) => api.post("/departements/", data);
export const exportDepartements = () => api.get("/departements/files/export");
export const getAllDepartements = (q, page) =>
  api.get(`/departements?q=${q}&page=${page}`);
export const deleteDepartement = (_id) => api.delete(`/departements/${_id}`);
export const updateDepartement = (_id, data) =>
  api.put(`/departements/${_id}`, data);
// ################################ CONTACT US ##############################
export const contactUs = (data) => api.post("/genral/contact-us/", data);
export const handleMessages = (data) =>
  api.post("/genral/handle-messages/", data);
export const getMessages = () => api.get("/genral/contact-us/"); // for admin
// ################################ HANDLE MULTIPART REQUEST FOR BOOKS ##############################
export const addNewBook = (data) =>
  api.post("/books/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
    },
  });
export const updateBook = (_id, data) =>
  api.put(`/books/${_id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
    },
  });
export const exportBooks = () => api.get("/books/files/export");
export const getAllBooks = (query, page, limit) =>
  api.get(
    `/books?qISBN=${query?.ISBN}&qTitle=${query?.title}&qStatus=${query?.status}&page=${page}&limit=${limit}&qCategory=${query.category}`
  );
export const deleteBook = (_id) => api.delete(`/books/${_id}`);
export const getBook = (_id) => api.get(`/books/${_id}`);
export const getAllCategoriesWithoutPagination = () =>
  api.get(`/categories?limit=200`);
export const getAllAlmirahsWithoutPagination = (query, page) =>
  api.get(`/almirahs?limit=200`);

/* EBOOK REQUESTS */

export const exportEBooks = () => api.get("/ebooks/files/export");
export const getAllEBooks = (query, page, limit) =>
  api.get(
    `/ebooks?qISBN=${query?.ISBN}&qTitle=${query?.title}&qCategory=${query?.category}&page=${page}&limit=${limit}`
  );
export const deleteEBook = (_id) => api.delete(`/ebooks/${_id}`);
export const getEBook = (_id) => api.get(`/ebooks/${_id}`);
export const addNewEBook = (data) =>
  api.post("/ebooks/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
    },
  });
export const updateEBook = (_id, data) =>
  api.put(`/ebooks/${_id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
    },
  });
/* ################################   TRANSACTIONS ######################################### */
export const getAdminDashboardStats = () =>
  api.get(`transactions/admin-dashboard-stats`);
export const getAllIssuedBooks = (query, page) =>
  api.get(
    `/transactions/issued-books?email=${query.email}&rollNumber=${query.rollNumber}&ISBN=${query.ISBN}&page=${page}`
  );
export const getAllReservedBooks = (page) =>
  api.get(`transactions/reserved-books?page=${page}`);
export const getAllReturnedBooks = (page) =>
  api.get(`transactions/returned-books?page=${page}`);
export const payFine = (data) => api.post("/transactions/pay-fine", data);
export const ReturnBook = (data) => api.post("transactions/return-book", data);

/* TO GET USER DETAILS AND CHECK HOW MANY BOOKS IT ALREADY BORROWED */
export const getUserInfo = (query) =>
  api.get(
    `transactions/user-info?qEmail=${query.email}&qRollNumber=${query.rollNumber}`
  );
export const getBookInfo = (query) =>
  api.get(`transactions/book-info?qISBN=${query.ISBN}`);
export const issueBook = (data) => api.post(`transactions/issue-book`, data);
export const reservedBook = (data) =>
  api.post(`transactions/reserved-book`, data);

// RENEW BOOK REQUESTS
export const renewBookRequest = (data) =>
  api.post("/transactions/renew-book", data);
export const getRenewRequests = () => api.get("/transactions/renew-books");
export const handleRenewRequest = (data) =>
  api.post("/transactions/handle-renew-request", data);

// student,teachers dashboard
export const getUserDashboardStats = () =>
  api.get(`transactions/user-dashboard-stats`);
export const getBorrowedBooks = () =>
  api.get(`transactions/borrowed-books-user`);
export const getReservedBooks = () =>
  api.get(`transactions/reserved-books-user`);
export const getReturnedBooks = () =>
  api.get(`transactions/returned-books-user`);
export const unReservedBook = (_id) =>
  api.get(`transactions/unreserved-book/${_id}`);

/* CLEARANCE FORM REQUESTS */
export const submitClearanceForm = (data) =>
  api.post("/clearance/submit-form/", data);
export const getClearanceRequestByStudent = () =>
  api.get("/clearance/student-requests");
export const getClearanceRequests = (query, requestStatus, currentPage) =>
  api.get(
    `/clearance/requests?status=${requestStatus}&role=${query.role}&page=${currentPage}`
  );
export const handleClearanceRequest = (data) =>
  api.post("/clearance/handle-request/", data);

// interceptor
api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest.isRetry
    ) {
      originalRequest.isRetry = true;
      // refresh token request
      try {
        await axios.get("http://localhost:5000/api/auth/refresh-tokens", {
          withCredentials: true,
        });

        //  original Request again
        return api.request(originalRequest);
      } catch (error) {
        // console.log('Error comes in interceptor');
        // console.log(error);
      }
    } else {
      throw error;
    }
  }
);

// status of request
export const STATUSES = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
});
