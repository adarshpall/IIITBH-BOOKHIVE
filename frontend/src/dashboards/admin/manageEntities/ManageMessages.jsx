import React, { useEffect, useState } from "react";
import Modal from "../../../components/dashboard/modal/Modal";
import { getMessages, handleMessages } from "../../../http";
import toast from "react-hot-toast";

const ManageMessages = () => {
  const [messages, setMessages] = useState(null);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage,setReplyMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const { data } = await getMessages();
      //   console.log(data);
      setMessages(data?.messages);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (action) => {
    const promise = handleMessages({
      action: action,
      _id : selectedMessage._id,
      replyMessage: replyMessage,
    });
    toast.promise(promise, {
      loading: "Lading...",
      success: (data) => {
        setShowReadModal(false);
        setShowReplyModal(false);
        setMessages((prevState)=>{
            const newState = prevState.filter((item)=> item._id !== selectedMessage._id);
            return newState;
        });
        setReplyMessage("");
        return "Processed successfully..";
      },
      error: (err) => {
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  }
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="datalist__wrapper">
      <h2>Messages</h2>
      <span>List of all unread messages</span>

      <div className="table__wrapper">
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr className="bg__secondary">
              <td>No.</td>
              <td>Name</td>
              <td>Email</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {messages?.map((message, index) => {
              return (
                <tr key={message._id}>
                  <td>{index + 1}</td>
                  <td>{message?.name}</td>
                  <td>{message?.email}</td>
                  <td>
                    <div>
                      <button
                        className="btn btn__success"
                        style={{ marginRight: "10px" }}
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowReadModal(true);
                        }}
                      >
                        Read
                      </button>
                      <button
                        className="btn btn__warning"
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowReplyModal(true);
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* READ MODAL */}

      <Modal
        title="Message Details"
        show={showReadModal}
        onClose={() => {
          setShowReadModal(false);
        }}
      >
        <h4 style={{margin:"13px 0"}}>
          From {selectedMessage?.name} {`< ${selectedMessage?.email} >`}
        </h4>
        <p>Message : {selectedMessage?.message}</p>

        <div className="actions">
          <button
            className="btn btn__danger"
            onClick={() => {
              setShowReadModal(false);
            }}
          >
            Cancel
          </button>
          <button className="btn btn__warning" onClick={()=>{handleSubmit()}}>Mark as Read</button>
          <button className="btn btn__success" onClick={()=>{setShowReadModal(false); setShowReplyModal(true)}}>Reply</button>
        </div>
      </Modal>

      {/* REPLY MODAL */}

      <Modal
        title="Reply Message"
        onClose={() => {
          setShowReplyModal(false);
        }}
        show={showReplyModal}
      >
        <div className="form-control">
          <textarea
            name="reply"
            id="desc"
            cols="30"
            rows="6"
            placeholder="Enter your reply here..."
            className="bg text__color"
            value={replyMessage}
            onChange={(e)=>{setReplyMessage(e.target.value)}}
            required
          ></textarea>
        </div>

        <div className="actions">
          <button
          
            className="btn btn__danger"
            onClick={() => {
              setShowReplyModal(false);
            }}
          >
            Cancel
          </button>
          <button className="btn btn__success" type="button" onClick={()=>{handleSubmit("reply")}}>SEND</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageMessages;
