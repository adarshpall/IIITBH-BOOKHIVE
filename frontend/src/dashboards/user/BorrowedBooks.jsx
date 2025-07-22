import React, { useEffect, useState } from "react";
import { getBorrowedBooks, renewBookRequest } from "../../http";
import { formatDate } from "../../utils/formatDate";
import Modal from "../../components/dashboard/modal/Modal";
import toast from "react-hot-toast";

const columns = [
  "ISBN",
  "Title",
  "Author",
  "Borrowed Date",
  "Due Date",
  "Days Left",
  "Renew Status",
];

function calculateDaysLeft(dueDateISO) {
  const dueDate = new Date(dueDateISO);
  const currentDate = new Date();

  const timeDifference = dueDate - currentDate;

  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference > 0) {
    return `${daysDifference} days left`;
  } else if (daysDifference === 0) {
    return "Due today";
  } else {
    return `${Math.abs(daysDifference)} days overdue`;
  }
}

const BorrowedBooks = () => {
  const [books, setBooks] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchBorrowedBooks = async () => {
    try {
      const { data } = await getBorrowedBooks();
      // console.log(data?.borrowedBooks);
      setBooks(data?.borrowedBooks);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRenewRequest = (e) => {
    e.preventDefault();
    const promise = renewBookRequest({
      transactionID: selectedTransaction,
      renewalDays: e.target.renewalDays.value,
    });
    toast.promise(promise, {
      loading: "Loading...",
      success: (response) => {
        const updatedBookData = response.data.transaction;
        console.log(updatedBookData);
        // Update the book in state
        setBooks((prevBooks) => {
          const bookIndex = prevBooks.findIndex(
            (book) => book._id === updatedBookData._id
          );
          prevBooks[bookIndex] = updatedBookData;
          return [...prevBooks];
        });
        console.log(books);
        e.target.renewalDays.value = "";
        setShowModal(false);
        return "Request sends successfully! We sends mail to update you.";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);
  return (
    <div className="datalist__wrapper">
      <h2>Borrowed Books</h2>
      <span>List of borrowed books</span>

      <div className="table__wrapper bg__accent">
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr className="bg__secondary">
              <td>Sr#</td>
              {columns?.map((column) => {
                return <td key={column}>{column}</td>;
              })}
            </tr>
          </thead>
          <tbody>
            {books?.map((item, index) => {
              return (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item?.book?.ISBN}</td>
                  <td>{item?.book?.title}</td>
                  <td>{item?.book?.author}</td>
                  <td>{formatDate(item?.borrowDate)}</td>
                  <td>{formatDate(item?.dueDate)}</td>
                  <td>{calculateDaysLeft(item?.dueDate)}</td>
                  <td>
                    {item?.renewStatus === "None" ? (
                      <button
                        className="btn btn__secondary"
                        onClick={() => {
                          setShowModal(true);
                          setSelectedTransaction(item._id);
                        }}
                      >
                        RENEW
                      </button>
                    ) : (
                      <span
                        className={`badge ${
                          item?.renewStatus === "Pending"
                            ? "badge__warning"
                            : item?.renewStatus === "Rejected"
                            ? "badge__danger"
                            : "badge__success"
                        }`}
                      >
                        {item?.renewStatus}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL FOR RENEW */}
      <Modal
        show={showModal}
        title={"Renew Book"}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <form onSubmit={handleRenewRequest}>
          <div className="form-control">
            <label htmlFor="renewalDays">Select Days</label>
            <select
              name="renewalDays"
              id="renewalDays"
              required
              className="bg text__color"
            >
              <option value="">How many days you want to renew book</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
            </select>
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={() => {
                setShowModal(false);
              }}
            >
              CANCEL
            </button>
            <button type="submit" className="btn btn__success">
              SEND
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowedBooks;
