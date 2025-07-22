import React, { useEffect, useState } from "react";
import {
  addNewBatch,
  exportBatches,
  getAllBatches,
  updateBatch,
} from "../../../http";
import { toast } from "react-hot-toast";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Modal, Pagination } from "../../../components";

const ManageBatch = () => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showAddNewModel, setShowAddNewModel] = useState(false);
  const [showUpdateModel, setShowUpdateModel] = useState(false);

  const initialState = {
    _id: "",
    name: "",
    startingYear: "",
    endingYear : "",
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
    const promise = addNewBatch({
      name: formData.name,
      startingYear: formData.startingYear,
      endingYear : formData.endingYear
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

  const handleUpdate = (e) => {
    e.preventDefault();
    const promise = updateBatch(formData?._id, {
        name: formData.name,
        startingYear: formData.startingYear,
        endingYear : formData.endingYear
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
    const promise = exportBatches();
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
      const { data } = await getAllBatches(query, currentPage);
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
        <h2>Manage Batches</h2>
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
          placeholder="Search batches...."
          className="background__accent text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <button
          className="btn btn__primary"
          onClick={() => {
            setQuery("");
          }}
        >
          CLEAR
        </button>
      </div>

      <div className="table__wrapper">
        <table className="background__accent" cellSpacing="0" cellPadding="0">
          <thead className="bg__secondary">
            <tr>
              <td>ID</td>
              <td>Name</td>
              <td>Starting Year</td>
              <td>Ending Year</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {data?.batches?.map((i) => {
              return (
                <tr key={i._id}>
                  <td>{i._id}</td>
                  <td>{i.name}</td>
                  <td>{i.startingYear}</td>
                  <td>{i.endingYear}</td>
                  <td>
                    <button
                      className="btn btn__warning"
                      onClick={() => {
                        setFormData({
                            _id : i._id,
                            name: i.name,
                            startingYear: i.startingYear,
                            endingYear : i.endingYear
                        });
                        setShowUpdateModel(true);
                      }}
                    >
                      <FaEdit />
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
        title="ADD NEW BATCH"
        show={showAddNewModel}
        onClose={handleCloseAddNewModel}
      >
        <form onSubmit={handleAddNew}>
          <div className="form-control">
            <label htmlFor="name">Batch Name</label>
            <input
              type="text"
              placeholder="Enter batch name"
              name="name"
              className="bg text__color"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="startingYear">Batch Starting Year</label>
            <input
              type="number"
              placeholder="Enter starting year"
              name="startingYear"
              className="bg text__color"
              value={formData.startingYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="endingYear">Batch Ending Year</label>
            <input
              type="number"
              placeholder="Enter ending year"
              name="endingYear"
              className="bg text__color"
              value={formData.endingYear}
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
            <label htmlFor="name">Batch Name</label>
            <input
              type="text"
              placeholder="Enter batch name"
              name="name"
              className="bg text__color"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="startingYear">Batch Starting Year</label>
            <input
              type="number"
              placeholder="Enter starting year"
              name="startingYear"
              className="bg text__color"
              value={formData.startingYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="endingYear">Batch Ending Year</label>
            <input
              type="number"
              placeholder="Enter ending year"
              name="endingYear"
              className="bg text__color"
              value={formData.endingYear}
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

export default ManageBatch;
