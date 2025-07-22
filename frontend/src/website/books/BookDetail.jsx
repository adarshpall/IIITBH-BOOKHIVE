import React, { useEffect, useState } from "react";
import image from "../../assets/cover404.jpg";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BASE_URL,
  STATUSES,
  createReview,
  getBook,
  reservedBook,
} from "../../http";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { formatDate } from "../../utils/formatDate";
import Stars from "../../components/website/stars/Stars";

const BookDetail = () => {
  const [book, setBook] = useState();
  const [status, setStatus] = useState(STATUSES.IDLE);
  const { _id } = useParams();
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const submitReview = (e) => {
    e.preventDefault();
    const promise = createReview(_id, {
      rating: e.target.rating.value,
      comment: e.target.comment.value,
    });
    toast.promise(promise, {
      loading: "Adding...",
      success: (response) => {
        e.target.rating.value = "";
        e.target.comment.value = "";
        console.log(response);
        setBook(response?.data?.book);
        return "Review added successfully..";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleReservedBook = () => {
    const promise = reservedBook({
      ISBN: book?.ISBN,
    });
    toast.promise(promise, {
      loading: "Reserving...",
      success: (response) => {
        setBook(response?.data?.book);
        return "Reserved successfully..";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const fetchBook = async () => {
    setStatus(STATUSES.LOADING);
    try {
      const { data } = await getBook(_id);
      setBook(data);
      setStatus(STATUSES.IDLE);
    } catch (error) {
      console.log(error);
      setStatus(STATUSES.ERROR);
    }
  };

  useEffect(() => {
    fetchBook();
  }, []);

  if (status === STATUSES.LOADING) {
    return <div className="">Loading....</div>;
  }

  if (status === STATUSES.ERROR) {
    return <div className="alert alert__danger">Something went wrong</div>;
  }

  return (
    <div className="book__detail bg text__color">
      <button
        className="btn btn__secondary"
        style={{ marginBottom: "10px" }}
        onClick={() => {
          navigate(-1);
        }}
      >
        Go Back
      </button>

      <div className="book__container">
        <div className="image">
          <img
            src={book?.imagePath ? `${BASE_URL}/${book?.imagePath}` : image}
            alt="book image"
          />
        </div>
        <div className="content">
          <h2>{book?.title}</h2>
          <p>ISBN is {book?.ISBN}</p>
          <p>By {book?.author}</p>
          <p>
            <Stars rating={book?.rating} />
          </p>
          <p>
            {book?.totalReviews} Reviews | {book?.rating} out of 5
          </p>
          <p style={{ display: "flex", columnGap: "5px" }}>
            <span>Status : </span>{" "}
            <span
              className={`badge ${
                book?.status === "Available"
                  ? "badge__success"
                  : book?.status === "Issued"
                  ? "badge__danger"
                  : book?.status === "Reserved"
                  ? "badge__warning"
                  : "badge__info"
              }`}
            >
              {book?.status}
            </span>
          </p>
          <p>
            <span>Category : </span>
            {book?.category?.name}
          </p>
          <p>
            <span>Almirah :</span> {book?.almirah?.number} (
            {book?.almirah?.subject})
          </p>
          <p>
            <span>Edition : </span>
            {book?.edition}
          </p>
          <p>
            <span>Publisher : </span>
            {book?.publisher}
          </p>
          <p>
            <span>Description :</span>
            {book?.description}
          </p>

          {/* CHECK USER IS LOGIN AND BOOK STATUS IS AVAILABE THEN ALLOW TO RESERVED BOOK */}

          <div className="action">
            {book?.status === "Available" ? (
              auth?.isAuth ? (
                <div>
                  <button
                    className="btn btn__secondary"
                    onClick={handleReservedBook}
                  >
                    RESERVE BOOK
                  </button>
                </div>
              ) : (
                <div>
                  <h3>
                    Login to reserve this book.{" "}
                    <Link className="btn btn__primary" to="/login">
                      Login
                    </Link>
                  </h3>
                </div>
              )
            ) : (
              <p className="badge badge__danger" style={{ width: "210px" }}>
                This book is currently {book?.status}.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="reviews__container">
        <h1>REVIEWS</h1>

        <h4>Write a Review</h4>
        {!auth?.isAuth && (
          <span>
            Please login in order to review on a book.{" "}
            <Link to="/login" className="text__primary">
              Login
            </Link>{" "}
          </span>
        )}
        <form onSubmit={submitReview}>
          <div className="form-control ">
            <label htmlFor="rating">Rating</label>
            <select
              name="rating"
              id="rating"
              className="bg__accent text__color"
              required
              disabled={!auth?.isAuth}
            >
              <option value="">Select</option>
              <option value={1}>1-Poor</option>
              <option value={2}>2-Fair</option>
              <option value={3}>3-Good</option>
              <option value={4}>4-Very Good</option>
              <option value={5}>5-Excellent</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="comment">Comment</label>
            <textarea
              name="comment"
              id="comment"
              cols="30"
              rows="4"
              className="bg__accent text__color"
              required
              disabled={!auth?.isAuth}
            ></textarea>
          </div>
          <div style={{ margin: "20px 0" }}>
            <button
              type="submit"
              className="btn btn__secondary"
              disabled={!auth?.isAuth}
            >
              SUBMIT
            </button>
          </div>
        </form>

        {book?.reviews?.map((review) => {
          return (
            <div className="review" key={review._id}>
              <p className="text__primary">
                {review?.user?.name ? review?.user?.name : auth?.user?.name}
              </p>
              <p className="date">{formatDate(review.createdAt)}</p>
              <p>
                <Stars rating={review?.rating} />
              </p>
              <p>{review?.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookDetail;
