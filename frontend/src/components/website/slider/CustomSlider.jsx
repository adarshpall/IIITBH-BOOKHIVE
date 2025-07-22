import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./slider.scss";
import defaultBookCover from "../../../assets/cover404.jpg";
import { BASE_URL } from "../../../http";

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
      },
    },

    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      },
    },
  ],
};

const CustomSlider = ({ data }) => {
  const slider = useRef(null);

  return (
    <section className="book__slider">
      <div className="container">
        {/* previous and next button */}
        <button
          onClick={() => {
            slider?.current?.slickPrev();
          }}
          className="btn__circle btn__prev"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={() => {
            slider?.current?.slickNext();
          }}
          className="btn__circle btn__next"
        >
          <FaArrowRight />
        </button>
        <div className="heading">
          <h1>New Arrivals</h1>
        </div>
        <Slider ref={slider} {...settings}>
          {data?.map((book) => {
            return (
              <div className="book__card bg__accent">
                <img
                  src={
                    book?.imagePath
                      ? `${BASE_URL}/${book?.imagePath}`
                      : defaultBookCover
                  }
                  alt="book image"
                />
                <div className="body">
                  <h3>{book.title}</h3>
                  <p>By {book.author}</p>
                  <div className="action">
                    <Link
                      className="btn btn__primary"
                      to={`/books/${book._id}`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

export default CustomSlider;
