import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  addNewBook,
  getAllAlmirahsWithoutPagination,
  getAllCategoriesWithoutPagination,
  getBook,
  updateBook,
} from "../../../http";
import { useNavigate, useParams } from "react-router-dom";

const UpdateBook = () => {
  const { _id } = useParams();
  const [categories, setCategories] = useState();
  const [almirahs, setAlmirahs] = useState();
  const navigate = useNavigate();
  const initailState = {
    ISBN: "",
    title: "",
    category: "",
    author: "",
    almirah: "",
    publisher: "",
    shelf: "",
    image: "",
    edition: "",
    description: "",
  };
  const [formData, setFormData] = useState(initailState);

  //   handle change into input fields
  const hanldeInputChange = (e) => {
    const { name, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToPost = new FormData();
    for (const key in formData) {
      if (formData[key] !== "") {
        dataToPost.append(key, formData[key]);
      }
    }

    const promise = updateBook(_id,dataToPost);

    toast.promise(promise, {
      loading: "Updating...",
      success: (data) => {
        return "Book updated successfully..";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: bookData } = await getBook(_id);
        setFormData({
            ISBN : bookData.ISBN,
            title : bookData.title,
            category : bookData?.category?._id,
            almirah : bookData?.almirah?._id,
            author : bookData?.author,
            publisher : bookData?.publisher,
            shelf : bookData?.shelf,
            edition  : bookData?.edition,
            description : bookData?.description

        });
        const { data: categoriesData } =
          await getAllCategoriesWithoutPagination();
        setCategories(categoriesData?.categories);
        const { data: almirahsData } = await getAllAlmirahsWithoutPagination();
        setAlmirahs(almirahsData?.almirahs);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return (
    <div className="form">
      <h3 style={{ padding: "20px" }}>UPDATE BOOK</h3>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="input__container__3">
            <div className="form-control">
              <label htmlFor="ISBN">ISBN</label>
              <input
                type="text"
                placeholder="Enter ISBN"
                id="ISBN"
                required
                name="ISBN"
                value={formData.ISBN}
                onChange={hanldeInputChange}
              />
            </div>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                id="title"
                required
                name="title"
                value={formData.title}
                onChange={hanldeInputChange}
              />
            </div>
            {/* Category */}
            <div className="form-control">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                id="category"
                value={formData?.category}
                onChange={hanldeInputChange}
                className="bg__accent text__color"
                required
              >
                <option value="">Select Category</option>
                {categories?.map((i) => {
                  return (
                    <option key={i._id} value={i._id}>
                      {i.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* Almirah */}
            <div className="form-control">
              <label htmlFor="almirah">Almirah</label>
              <select
                name="almirah"
                id="almirah"
                value={formData?.almirah}
                onChange={hanldeInputChange}
                className="bg__accent text__color"
                required
              >
                <option value="">Select Almirah</option>
                {almirahs?.map((i) => {
                  return (
                    <option key={i._id} value={i._id}>
                      {i.subject} ({i.number})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                placeholder="Enter author"
                id="author"
                required
                name="author"
                value={formData.author}
                onChange={hanldeInputChange}
              />
            </div>

            <div className="form-control">
              <label htmlFor="publisher">Publisher(Optional)</label>
              <input
                type="text"
                placeholder="Enter Publisher"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={hanldeInputChange}
              />
            </div>

            <div className="form-control">
              <label htmlFor="image">Image(Optional)</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Select Image"
                id="image"
                name="image"
                onChange={hanldeInputChange}
              />
            </div>

            <div className="form-control">
              <label htmlFor="shelf">Shelf(Optional)</label>
              <select
                name="shelf"
                id="shelf"
                value={formData.shelf}
                onChange={hanldeInputChange}
                className="bg__accent text__color"
              >
                <option value="">Select Shelf</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="edition">edition(Optional)</label>
              <input
                type="text"
                placeholder="Enter Edition"
                id="edition"
                name="edition"
                value={formData.edition}
                onChange={hanldeInputChange}
              />
            </div>
            {/* tags */}
          </div>
          <br />
          <div className="form-control">
            <label htmlFor="desc">Description(Optional)</label>
            <textarea
              name="description"
              id="desc"
              cols="30"
              rows="3"
              placeholder="Enter Description"
              value={formData.description}
              onChange={hanldeInputChange}
              className="bg__accent text__color"
            ></textarea>
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={() => {
                navigate(-1);
              }}
            >
              Go Back
            </button>
            <button className="btn btn__primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBook;
