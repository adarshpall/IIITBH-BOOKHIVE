import React, { useEffect, useState } from "react";
import { getClearanceRequests, handleClearanceRequest } from "../../../http";
import { toast } from "react-hot-toast";
import { CountCard, Modal, Pagination } from "../../../components";
import { useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { useSelector } from "react-redux";

const ManageClearanceRequest = () => {
  const { status } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState({
    role: user?.role,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [requestStatus, setRequestStatus] = useState(status);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState();

  const handleUpdate = (clearanceRequestID, status, reason) => {
    const promise = handleClearanceRequest({
      clearanceRequestID,
      status,
      reason,
      role: user?.role,
    });
    toast.promise(promise, {
      loading: `${status === "Approved" ? "Aprroving..." : "Rejecting...."}`,
      success: (data) => {
        setShowRejectModal(false);
        fetchClearanceRequests();
        return `${
          status === "Approved"
            ? "Approved Successfully."
            : "Rejected Successfully."
        }`;
      },
      error: (err) => {
        console.log(err);
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  };

  const fetchClearanceRequests = async () => {
    try {
      const { data } = await getClearanceRequests(
        query,
        requestStatus,
        currentPage
      );
      setData(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Update the query when the status parameter changes
    setRequestStatus(status);
  }, [status]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setCurrentPage(1);
    // debouncing
    const handler = setTimeout(() => {
      fetchClearanceRequests();
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    fetchClearanceRequests();
  }, [currentPage, requestStatus]);

  // Use useEffect to update the query whenever the status changes

  return (
    <div className="manage__section bg manage__clearance">
      <div className="card__section">
        <h2>Manage Clearance Requests</h2>
      </div>

      {/* <div className="filter">
        <input
          type="text"
          placeholder="Search category...."
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
      </div> */}

      <div className="table__wrapper">
        <table className="background__accent" cellSpacing="0" cellPadding="0">
          <thead className="bg__secondary">
            <tr>
              <td>Roll Number</td>
              <td>Name</td>
              <td>Request Type</td>
              <td>Status</td>
              <td>Date</td>
              {requestStatus === "Pending" && <td>Actions</td>}
            </tr>
          </thead>
          <tbody>
            {data?.clearanceRequests?.map((request) => {
              return (
                <tr key={request._id}>
                  <td>{request?.user?.rollNumber}</td>
                  <td>{request.user?.name}</td>
                  <td>{request?.type}</td>
                  <td>
                    {user?.role === "Admin" ? (
                      <span
                        className={`badge ${
                          request?.librarianApprovalStatus === "Approved"
                            ? "badge__success"
                            : request?.librarianApprovalStatus === "Pending"
                            ? "badge__warning"
                            : "badge__danger"
                        }`}
                      >
                        {request?.librarianApprovalStatus}
                      </span>
                    ) : user?.role === "HOD" ? (
                      <span
                        className={`badge ${
                          request?.hodApprovalStatus === "Approved"
                            ? "badge__success"
                            : request?.hodApprovalStatus === "Pending"
                            ? "badge__warning"
                            : "badge__danger"
                        }`}
                      >
                        {request?.hodApprovalStatus}
                      </span>
                    ) : (
                      <span
                        className={`badge ${
                          request?.clerkApprovalStatus === "Approved"
                            ? "badge__success"
                            : request?.clerkApprovalStatus === "Pending"
                            ? "badge__warning"
                            : "badge__danger"
                        }`}
                      >
                        {request?.clerkApprovalStatus}
                      </span>
                    )}
                  </td>
                  <td>{formatDate(request?.updatedAt)}</td>
                  {requestStatus === "Pending" && (
                    <td>
                      <div style={{ width: "310px" }}>
                        <button
                          className="btn btn__success"
                          onClick={() => {
                            handleUpdate(request?._id, "Approved");
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn__danger"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                        >
                          Reject
                        </button>
                        <button className="btn btn__secondary">View</button>
                      </div>
                    </td>
                  )}
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

      <Modal
        title="Are you sure you want to reject request ? "
        show={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate(selectedRequest?._id, "Reject", e.target.reason.value);
          }}
        >
          <div className="form-control">
            <label htmlFor="reason">Reason of Rejection</label>
            <textarea
              name="reason"
              id="reason"
              cols="30"
              rows="4"
              className="bg text__color"
            ></textarea>
          </div>
          <div className="actions">
            <button
              className="btn btn__danger"
              type="button"
              onClick={() => {
                setShowRejectModal(false);
              }}
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

export default ManageClearanceRequest;
