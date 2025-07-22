import React, { useEffect, useState } from "react";
import {
  deleteEBook,
  exportEBooks,
  getAllEBooks,
} from "../../../http";

import { toast } from "react-hot-toast";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import {  Pagination } from "../../../components";
import { Link, useNavigate } from "react-router-dom";

const ManageEBook = () => {
  const [query, setQuery] = useState({ ISBN: "", title: "",category:""});
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const navigate = useNavigate();
 

  const handleDelete = (_id) => {
    const promise = deleteEBook(_id);
    toast.promise(promise, {
      loading: "deleting...",
      success: (data) => {
        fetchData();
        return "Book Deleted successfully..";
      },
      error: (err) => {
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleExport = () => {
    const promise = exportEBooks();
    toast.promise(promise, {
      loading: "Exporting...",
      success: (response) => {
        window.open(response?.data?.downloadUrl);
        return "Books Exported successfully";
      },
      error: (err) => {
        console.log(err);
        return "Something went wrong while exporting data.";
      },
    });
  };

  const fetchData = async () => {
    try {
      const { data } = await getAllEBooks(
        query,currentPage
      );
      console.log(data);
      setData(data);
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
    <div className="manage__section bg">
      <div className="header">
        <h2>Manage EBooks</h2>
        <div>
          <Link to="/admin/dashboard/add-new-ebook"
            className="btn btn__secondary"
          >
            Add New
          </Link>
          <button className="btn btn__secondary" onClick={handleExport}>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="filter">
        <input
          type="text"
          placeholder="Search by ISBN...."
          className="background__accent text"
          value={query.ISBN}
          onChange={(e) => {
            setQuery({ ...query, ISBN: e.target.value });
          }}
        />
        <input
          type="text"
          placeholder="Search by title...."
          className="background__accent text"
          value={query.title}
          onChange={(e) => {
            setQuery({ ...query, title: e.target.value });
          }}
        />
        {/* <select value={query.status} onChange={(e)=>{setQuery({...query,status:e.target.value});setCurrentPage(1)}} className="bg__accent text__color">
            <option value="">Filter by Status</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Reserved">Reserved</option>
            <option value="Lost">Lost</option>
        </select> */}
        <button
          className="btn btn__primary"
          onClick={() => {
            setQuery({ title: "", ISBN: "", category: "" });
          }}
        >
          CLEAR
        </button>
      </div>

      <div className="table__wrapper" style={{ overflow: "auto" }}>
        <table className="background__accent" cellSpacing="0" cellPadding="0">
          <thead className="bg__secondary">
            <tr>
              <td>ISBN</td>
              <td>Title</td>
              <td>Author</td>
              <td>Category</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {data?.books?.map((i) => {
              return (
                <tr key={i._id}>
                  <td>{i.ISBN}</td>
                  <td>{i.title}</td>
                  <td>{i.author}</td>
                 
                  <td>{i.category.name}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => {
                          navigate(`/admin/dashboard/ebook-details/${i._id}`);
                        }}
                        className="btn btn__success"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn__warning"
                        onClick={() => {
                          navigate(`/admin/dashboard/update-ebook/${i._id}`);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn__danger"
                        onClick={() => {
                          handleDelete(i._id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        data={data}
      />
    </div>
  );
};

export default ManageEBook;
