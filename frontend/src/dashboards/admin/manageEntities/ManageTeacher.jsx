import React, { useEffect, useState } from "react";
import {
    BASE_URL,
  addNewTeacher,
  deleteTeacher,
  exportTeachers,
  getAllTeachers,
  updateTeacher,
} from "../../../http";
import profileImage from "../../../assets/avatar.svg";


import { toast } from "react-hot-toast";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Modal, Pagination } from "../../../components";

const ManageTeacher = () => {
  const [query, setQuery] = useState({email:"",name:""});
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showAddNewModel, setShowAddNewModel] = useState(false);
  const [showUpdateModel, setShowUpdateModel] = useState(false);

  const initialState = {
    _id: "",
    name: "",
    fatherName: "",
    email: "",
  };
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseAddNewModel = () => {
    setShowAddNewModel(false);
    setFormData(initialState);
  };

  const handleCloseUpdateModel = () => {
    setShowUpdateModel(false);
    setFormData(initialState);
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    const promise = addNewTeacher({
      name: formData.name,
      fatherName: formData.fatherName,
      email: formData.email,
    });
    toast.promise(promise, {
      loading: "Saving...",
      success: (data) => {
        setFormData(initialState);
        fetchData();
        setShowAddNewModel(false);
        return "Added successfully..";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleDelete = (_id) => {
    const promise = deleteTeacher(_id);
    toast.promise(promise, {
      loading: "deleting...",
      success: (data) => {
        fetchData();
        return "Teacher Deleted successfully..";
      },
      error: (err) => {
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const promise = updateTeacher(formData?._id, {
      name: formData.name,
      fatherName: formData.fatherName,
      email: formData.email,
    });
    toast.promise(promise, {
      loading: "Updating...",
      success: (data) => {
        setFormData(initialState);
        fetchData();
        setShowUpdateModel(false);
        return "Updated successfully..";
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleExport = () => {
    const promise = exportTeachers();
    toast.promise(promise, {
      loading: "Exporting",
      success: (response) => {
        window.open(response?.data?.downloadUrl);
        return "Exported successfully";
      },
      error: (err) => {
        console.log(err);
        return "Something went wrong while exporting data.";
      },
    });
  };

  const fetchData = async () => {
    try {
      const { data } = await getAllTeachers(query.email,query.name, currentPage);
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
        <h2>Manage Teachers</h2>
        <div>
          <button
            className="btn btn__secondary"
            onClick={() => {
              setShowAddNewModel(true);
            }}
          >
            Add New
          </button>
          <button className="btn btn__secondary" onClick={handleExport}>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="filter">
        <input
          type="text"
          placeholder="Search by name...."
          className="background__accent text"
          value={query.name}
          onChange={(e) => {
            setQuery({...query,name:e.target.value});
          }}
        />
        <input
          type="text"
          placeholder="Search by email...."
          className="background__accent text"
          value={query.email}
          onChange={(e) => {
            setQuery({...query,email:e.target.value});
          }}
        />
        <button
          className="btn btn__primary"
          onClick={() => {
            setQuery({email:"",name:""});
          }}
        >
          CLEAR
        </button>
      </div>

      <div className="table__wrapper">
        <table className="background__accent" cellSpacing="0" cellPadding="0">
          <thead className="bg__secondary">
            <tr>
              <td>Name</td>
              <td>Image</td>
              <td>Father Name</td>
              <td>Email</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {data?.teachers?.map((i) => {
              return (
                <tr key={i._id}>
                  <td>{i.name}</td>
                  <td>
                    <img src={i.imagePath ? `${BASE_URL}/${i.imagePath}` : profileImage}  alt="avatar" className="avatar" />
                  </td>
                  <td>{i.fatherName}</td>
                  <td>{i.email}</td>
                  <td>
                    <button
                      className="btn btn__warning"
                      onClick={() => {
                        setFormData({
                          _id: i._id,
                          name: i.name,
                          fatherName: i.fatherName,
                          email: i.email,
                        });
                        setShowUpdateModel(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                     <button className="btn btn__danger" onClick={()=>{handleDelete(i._id)}}>
                      <FaTrash />
                    </button>
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

      {/* ADD NEW Batch FORM */}
      <Modal
        title="ADD NEW TEACHER"
        show={showAddNewModel}
        onClose={handleCloseAddNewModel}
      >
        <form onSubmit={handleAddNew}>
          <div className="form-control">
            <label htmlFor="name">Teacher Name</label>
            <input
              type="text"
              placeholder="Enter teacher name"
              name="name"
              className="bg text__color"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="fatherName">Father Name</label>
            <input
              type="text"
              placeholder="Enter father name"
              name="fatherName"
              className="bg text__color"
              value={formData.fatherName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              className="bg text__color"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={handleCloseAddNewModel}
            >
              CANCEL
            </button>
            <button type="submit" className="btn btn__success">
              SUBMIT
            </button>
          </div>
        </form>
      </Modal>

      {/* UPDATE ALMIRAH FORM */}
      <Modal
        title="UPDATE ALMIRAH"
        show={showUpdateModel}
        onClose={handleCloseUpdateModel}
      >
        <form onSubmit={handleUpdate}>
        <div className="form-control">
            <label htmlFor="name">Teacher Name</label>
            <input
              type="text"
              placeholder="Enter teacher name"
              name="name"
              className="bg text__color"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="fatherName">Father Name</label>
            <input
              type="text"
              placeholder="Enter father name"
              name="fatherName"
              className="bg text__color"
              value={formData.fatherName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              className="bg text__color"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={handleCloseUpdateModel}
            >
              CANCEL
            </button>
            <button type="submit" className="btn btn__success">
              UPDATE
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTeacher;
