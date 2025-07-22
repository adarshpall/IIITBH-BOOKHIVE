import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./books.scss";
import { AiOutlineSearch } from "react-icons/ai";
import defaultCover from "../../assets/cover404.jpg";
import { BASE_URL, getAllCategoriesWithoutPagination, getAllEBooks } from "../../http";
import Stars from "../../components/website/stars/Stars";
import { Pagination } from "../../components";

const EBooks = () => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  const [categories,setCategories] = useState(null);
  const [booksData, setBooksData] = useState(null);
  const [query, setQuery] = useState({
    ISBN: "",
    title: "",
    category: ""
    });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const { data: books } = await getAllEBooks(query, currentPage,10);
      const {data : categoriesData} = await getAllCategoriesWithoutPagination();
      setBooksData(books);
      setCategories(categoriesData?.categories);
      console.log(categoriesData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setCurrentPage(1);
    // debouncing
    const handler = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);
 

  return (
    <div className="books__wrapper bg text__color">
      <div className="sidebar__wrapper bg__accent">
        <div className="sidebar__content">
          <h3>Categories</h3>
          <ul>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={query?.category === ""}
                  onChange={() => {
                    setQuery({...query,category:""});
                  }}
                />
                All
              </label>
            </li>

            {
              categories?.map((i)=>{
                return <li key={i?._id}>
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        name="category"
                        checked={query.category === i?._id}
                        onChange={() => {
                          setQuery({...query,category:i?._id});
                        }}
                      />
                      {i?.name}
                    </label>
                  </li>
                </li>
              })
            }
          </ul>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="left">
            <h3>EBOOKS</h3>
            <p>List of digital books</p>
          </div>
          <form className="input__box bg__accent" tabindex="0">
            <input type="text" placeholder="Search books...." value={query.title} onChange={(e)=>{setQuery({...query,title : e.target.value})}} />
            <AiOutlineSearch />
          </form>
        </div>

        <section className="books__section">
          <div className="card__wrapper">
            {booksData?.books.length !== 0 ? booksData?.books?.map((book) => {
              return (
                <div className="card bg__accent">
                  <img src={book?.imagePath ? `${BASE_URL}/${book?.imagePath}` : defaultCover} alt="Book Image Not Found" />
                  <div className="content">
                    <h5>{book?.title}</h5>
                    <p>By {book?.author}</p>
                    <Stars rating={book?.rating} />
                    <p>{book?.totalReviews} Reviews | {book?.rating} out of 5</p>
                    <div className="action">
                      <Link className="btn btn__secondary" to={`/ebooks/${book?._id}`}>View Details</Link>
                    </div>
                  </div>
                </div>
              );
            }) : <h1 style={{margin:"20px auto"}}>Book Not Found</h1>}
          </div>
          <Pagination currentPage={currentPage} data={booksData} setCurrentPage={setCurrentPage} />
        </section>
      </div>
    </div>
  );
};

export default EBooks;
