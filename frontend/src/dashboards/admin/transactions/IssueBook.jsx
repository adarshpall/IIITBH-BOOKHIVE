import { useState } from "react";
import "./issuebook.scss";
import { getBookInfo, getUserInfo, issueBook } from "../../../http";
import { toast } from "react-hot-toast";
import { formatDate } from "../../../utils/formatDate";
const IssueBook = () => {
  const [userData, setUserData] = useState(null);
  const [bookData, setBookData] = useState(null);

  const searchStudent = (e) => {
    e.preventDefault();
    const promise = getUserInfo({
      email: e.target.email.value,
      rollNumber  : e.target.rollNumber.value,
    });
    toast.promise(promise, {
      loading: "Loading...",
      success: (data) => {
        setUserData(data?.data);
        /* CLEAR INPUT VALUE */
        e.target.email.value = "";
        e.target.rollNumber.value = "";
        return "Student searched successfully..";
      },
      error: (err) => {
        console.log();
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const searchBook = (e) => {
    e.preventDefault();
    const promise = getBookInfo({
      ISBN: e.target.ISBN.value,
    });
    toast.promise(promise, {
      loading: "Loading...",
      success: (data) => {
        setBookData(data?.data);
        e.target.ISBN.value = "";
        return "Book searched successfully..";
      },
      error: (err) => {
        console.log();
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleIssueBook = () => {
    /* CHECK USER AND BOOK FOUND OR NOT ?  */
    if (!userData || !bookData) {
      toast.error("Please select both book and user first !");
      return;
    }
    /* CHECK IF USER ALREADY BORROWED BOOKS AND EXCEED LIMIT */
    if (userData?.hasExceededLimit) {
      toast.error(`Limit exceeded !`);
      return;
    }
    /* CHECK IF BOOK STATUS IS ISSUED ? */
    if (bookData?.book?.status === "Issued") {
      toast.error(`Book alraeady issued to someone!`);
      return;
    }

    /* CHECK SAME USER RESERVED ? */
    if (bookData?.book?.status === "Reserved") {
      if (userData?.user?.email !== bookData?.reservedAlready?.user?.email) {
        toast.error("Book reserved by someone !");
        return;
      }
    }

    /* ISSUE BOOK BECAUSE ALL CONDITION VALID */
    const promise = issueBook({
      bookID: bookData?.book?._id,
      userID: userData?.user?._id,
    });
    toast.promise(promise, {
      loading: "Issuing...",
      success: (data) => {
        setBookData(null);
        setUserData(null);
        return "Book Issued successfully..";
      },
      error: (err) => {
        console.log();
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };
  return (
    <div className="issue__book">
      <h2>ISSUE BOOK</h2>
      <div className="details__container">
        <div className="student__details">
          {/* SEARCH SECTION */}
          <h3>Search Student</h3>
          <p>Find the user whom you want to issue books to.</p>
          <form onSubmit={searchStudent}>
            <div className="form-control">
              <input type="text" placeholder="Search by email" name="email" />
            </div>
            <div className="form-control">
              <input
                type="text"
                placeholder="Search by roll number"
                name="rollNumber"
              />
            </div>
            <button className="btn btn__secondary" type="submit">
              SEARCH
            </button>
          </form>

          {/* TABLE SECTION */}
          <div className="table__wrapper">
            <table>
              <tr>
                <th>Name</th>
                <td>{userData?.user?.name}</td>
              </tr>
              <tr>
                <th>Roll Number</th>
                <td>{userData?.user?.rollNumber}</td>
              </tr>

              <tr>
                <th>Email</th>
                <td>{userData?.user?.email}</td>
              </tr>

              <tr>
                <th>Role</th>
                <td>{userData?.user?.role}</td>
              </tr>

              <tr>
                <th>Account Status</th>
                <td>{userData?.user?.accountStatus}</td>
              </tr>

              <tr>
                <th>Borrowed Books</th>
                <td>{userData?.numberOfBorrowedBooks}</td>
              </tr>

              <tr>
                <th>Maximum Book Allowed</th>
                <td>{userData?.maxBooksAllowed}</td>
              </tr>

              <tr>
                <th>Exceed Limit</th>
                <td>
                  {userData?.hasExceededLimit ? (
                    <span className="badge badge__danger">Yes</span>
                  ) : (
                    <span className="badge badge__success">No</span>
                  )}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className="book__details">
          <h3>Search Book</h3>
          <p>Find the book you want to issue</p>
          <form onSubmit={searchBook}>
            <div className="form-control">
              <input
                type="text"
                placeholder="Search by ISBN"
                required
                name="ISBN"
              />
            </div>
            <button className="btn btn__secondary" type="submit">
              SEARCH
            </button>
          </form>

          {/* TABLE SECTION */}
          <div className="table__wrapper">
            <table>
              <tr>
                <th>ISBN</th>
                <td>{bookData?.book?.ISBN}</td>
              </tr>

              <tr>
                <th>Title</th>
                <td>{bookData?.book?.title}</td>
              </tr>
              <tr>
                <th>Author</th>
                <td>{bookData?.book?.author}</td>
              </tr>

              <tr>
                <th>Status</th>
                <td>
                  <span
                    className={`badge ${
                      bookData?.book?.status === "Available"
                        ? "badge__success"
                        : bookData?.book?.status === "Issued"
                        ? "badge__danger"
                        : bookData?.book?.status === "Reserved"
                        ? "badge__warning"
                        : "badge__info"
                    }`}
                  >
                    {bookData?.book?.status}
                  </span>
                </td>
              </tr>

              {bookData?.reservedAlready && (
                <>
                  <tr>
                    <th>Reserved By</th>
                    <td>{bookData?.reservedAlready?.user?.email}</td>
                  </tr>

                  <tr>
                    <th>Reserved Date</th>
                    <td>{formatDate(bookData?.reservedAlready?.date)}</td>
                  </tr>
                </>
              )}
            </table>
          </div>

          {/* ISSUE BUTTON */}
          <button className="btn btn__primary" onClick={handleIssueBook}>
            ISSUED BOOK
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;
