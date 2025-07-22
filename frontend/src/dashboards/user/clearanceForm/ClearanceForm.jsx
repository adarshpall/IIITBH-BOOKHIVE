import React from "react";
import { Modal } from "../../../components";
import { useState } from "react";
import { FaDownload } from "react-icons/fa";
import {
  BASE_URL,
  getClearanceRequestByStudent,
  submitClearanceForm,
} from "../../../http";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

const ClearanceForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState(null);

  const initialState = {
    type: "",
    additionalInformation: "",
  };
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseModel = () => {
    setShowModal(false);
    setFormData(initialState);
  };

  const fetchRequests = async () => {
    try {
      const { data } = await getClearanceRequestByStudent();
      console.log(data?.clearanceRequests);
      setRequests(data?.clearanceRequests);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promise = submitClearanceForm(formData);
    toast.promise(promise, {
      loading: "Submitting...",
      success: (data) => {
        setFormData(initialState);
        setShowModal(false);
        fetchRequests();
        return "Request submitted successfully..";
      },
      error: (err) => {
        console.log();
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const handleDownload = (request) => {
    if (request.status === "Pending" || request.status === "Rejected") {
      toast.error(
        `Cannot get printed clearance form becoz request status is ${request.status}`
      );
    }
    window.open(`${BASE_URL}/${request.pdfLink}`)
    // CHECK STATUS OF REQUEST..... IF PENDING THEN SHOW TOAST AND IF REJECTED THEN ALSO....
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="datalist__wrapper">
      <h2>Clearance Requests</h2>
      <p className="text__danger">
        After clearance approval, your account will be disabled, preventing
        further borrowing or reservations of books
      </p>
      <div style={{ textAlign: "right" }}>
        <button
          className="btn btn__primary"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Add request
        </button>
      </div>
      <div className="table__wrapper bg__accent">
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr className="bg__secondary">
              <td>No.</td>
              <td>Made By</td>
              <td>Type</td>
              <td>Librarian Approvel</td>
              <td>Clerk Approvel</td>
              <td>HOD Approvel</td>

              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {requests?.map((i, index) => {
              return (
                <tr>
                  <td>{index + 1}</td>
                  <td>{i?.user?.name}</td>
                  <td>{i?.type}</td>
                  <td>
                    <span
                      className={`badge ${
                        i?.librarianApprovalStatus === "Pending"
                          ? "badge__warning"
                          : i?.librarianApprovalStatus === "Approved"
                          ? "badge__success"
                          : "badge__danger"
                      } `}
                    >
                      {i.librarianApprovalStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        i?.clerkApprovalStatus === "Pending"
                          ? "badge__warning"
                          : i?.clerkApprovalStatus === "Approved"
                          ? "badge__success"
                          : "badge__danger"
                      } `}
                    >
                      {i.clerkApprovalStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        i?.hodApprovalStatus === "Pending"
                          ? "badge__warning"
                          : i?.hodApprovalStatus === "Approved"
                          ? "badge__success"
                          : "badge__danger"
                      } `}
                    >
                      {i.hodApprovalStatus}
                    </span>
                  </td>

                  <td>
                    <div style={{ width: "200px" }}>
                      <button
                        className="btn btn__primary"
                        onClick={() => {
                          handleDownload(i);
                        }}
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        title="Add New Request"
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="name">Request Type</label>
            <select
              name="type"
              id="type"
              className="bg text__color"
              value={formData.type}
              required
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="Graduation">Graduation Clearance</option>
              <option value="Transfer">Transfer Clearance</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="additionalInformation">
              Additional Information(Optional)
            </label>
            <textarea
              name="additionalInformation"
              id=""
              cols="30"
              rows="4"
              value={formData.additionalInformation}
              onChange={handleChange}
              className="bg text__color"
            ></textarea>
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={handleCloseModel}
            >
              CANCEL
            </button>
            <button type="submit" className="btn btn__success">
              SUBMIT
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClearanceForm;
