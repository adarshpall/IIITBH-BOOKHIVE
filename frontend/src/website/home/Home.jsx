import "./home.scss";
import { Link } from "react-router-dom";

import principalImage from "../../assets/principal.jpg";
import bookImage from "../../assets/book1.jpg";
import { FaAtlas, FaBook, FaLayerGroup, FaUser } from "react-icons/fa";
import { CustomSlider, Loader, Stars } from "../../components";
import { useEffect, useState } from "react";
import { BASE_URL, STATUSES, getHomePageData } from "../../http";

const Home = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(STATUSES.IDLE);

  const fetchData = async () => {
    setStatus(STATUSES.LOADING);
    try {
      const { data } = await getHomePageData();
      setData(data);
      // console.log(data);
      setStatus(STATUSES.IDLE);
    } catch (error) {
      setStatus(STATUSES.ERROR);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (status === STATUSES.LOADING) {
    return <Loader />;
  }

  if (status === STATUSES.ERROR) {
    return <div className="text__color">Error while loading data........</div>;
  }

  return (
    <div className="bg text__color">
      {/* Hero Section */}
      <section className="hero ">
        <h1>Welcome to INDIAN INSTITUTE OF INFORMATION TECHONOLOGY,BHAGALPUR Library</h1>
        <span className="subheading">
          Explore our vast collection of books and resources.
        </span>

        <Link to="/books" className="btn btn__secondary">
          Browse Catalog
        </Link>
      </section>
      {/* End of Hero Section */}

      {/* Welcome Message */}
      <section className="welcome">
        <div className="left">
          <div className="heading">
            <h1>Welcome Message </h1>
          </div>
          <p>
            Welcome to IIITBH BOOKHIVE 
          </p>
          <p>
            Our modern, fully automated college library is undoubtedly a
            state-of-the-art Information Resource Center which fulfills
            ever-evolving needs of our academic clientele. We are dedicated to
            support the curriculum and educational mission of the college. The
            aim of the IIITBH BOOKHIVE is to deliver the best print, digital and
            online information resources and reference services to support your
            teaching, learning, and research activities. We also provide
            conducive environment and wonderful spaces for research, study and
            collaboration.
          </p>
        </div>

        <div className="right">
          <img src={principalImage} alt="Principal Image" />
        </div>
      </section>
      {/* End of Welcome message */}

      {/* START OF POPULAR BOOKS SECTIONS */}
      <section className="popular__books">
        <div className="heading">
          <h1>Popular Books</h1>
        </div>
        <div className="card__wrapper">
          {data?.popularBooks?.map((popularBook) => {
            return (
              <div className="card bg__accent" key={popularBook._id}>
                <img
                  src={
                    popularBook?.imagePath
                      ? `${BASE_URL}/${popularBook?.imagePath}`
                      : bookImage
                  }
                  alt="Book Image Not Found"
                />
                <div className="content">
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "500",
                      marginBottom: "10px",
                    }}
                  >
                    {popularBook.title}
                  </p>
                  <p>By {popularBook.author}</p>
                  <p>
                    <Stars rating={popularBook.rating} />{" "}
                  </p>
                  <p>
                    {popularBook?.totalReviews} Reviews | {popularBook?.rating}{" "}
                    out of 5
                  </p>
                  <div className="action">
                    <Link
                      className="btn btn__secondary"
                      to={`/books/${popularBook._id}/`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="button">
          <Link to="/books" className="btn btn__primary">
            See All
          </Link>
        </div>
      </section>
      {/* END OF POPULAR BOOKS SECTIONS */}

      {/* Counter Section */}
      <section className="counter__section">
        <div>
          <FaBook className="icon" />
          <h3>Total Books</h3>
          <p>{data?.totalBooks}</p>
        </div>

        <div>
          <FaAtlas className="icon" />
          <h3>Total EBooks </h3>
          <p>{data?.totalEBooks}</p>
        </div>
        <div>
          <FaUser className="icon" />
          <h3>Total Users </h3>
          <p>{data?.totalUsers}</p>
        </div>
        <div>
          <FaLayerGroup className="icon" />
          <h3>Total Categories</h3>
          <p>{data?.totalCategories}</p>
        </div>
      </section>
      {/* End of Counter Section */}

      <CustomSlider data={data?.newBooks} />
    </div>
  );
};

export default Home;
