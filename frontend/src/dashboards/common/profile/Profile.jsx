import "./profile.scss";
import profileImage from "../../../assets/avatar.svg";
import { useState } from "react";
import { Modal } from "../../../components";
import { BASE_URL, updateProfileImage } from "../../../http";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../../store/slices/authSlice";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [image, setImage] = useState(
    user?.imagePath ? `${BASE_URL}/${user?.imagePath}` : profileImage
  );
  const [show, setShow] = useState(false);
  /* IF IMAGE CHANGE THEN UPDATE */
  const [isUpdate, setIsUpdate] = useState(false);
  const dispatch = useDispatch();

  const handleCloseModel = () => {
    setShow(false);
    setImage(user?.imagePath ? `${BASE_URL}/${user?.imagePath}` : profileImage);
  };

  const captureImage = (e) => {
    const file = e.target.files[0];
    // console.log(file);
    setIsUpdate(true);
    /* BROWSER API */
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      // console.log(reader.result);
      setImage(reader.result);
    };
  };

  const handleUpdate = async (e) => {
    if (!isUpdate) {
      toast.error("Please select image first to update !");
      return;
    }
    const promise = updateProfileImage({ avatar: image });
    toast.promise(promise, {
      loading: "Updating...",
      success: (res) => {
        dispatch(setAuth(res?.data));
        setShow(false);
        return "Image updated successfully !";
      },
      error: (err) => {
        console.log(err);
        return "Something went wrong while updaing image";
      },
    });
  };
  return (
    <div className="profile__wrapper bg">
      <div className="profile__container bg__accent">
        <div className="avatar">
          <img src={image} alt="not found" />
        </div>
        <p
          className="text__primary"
          onClick={() => {
            setShow(true);
          }}
        >
          Change Profile Image ?
        </p>
        <div className="table__wrapper">
          <table>
            <tr>
              <th>Name</th>
              <td>{user?.name}</td>
            </tr>
            <tr>
              <th>Father Name</th>
              <td>{user?.fatherName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user?.email}</td>
            </tr>

            <tr>
              <th>Role</th>
              <td>{user?.role}</td>
            </tr>

            <tr>
              <th>Account Status</th>
              <td>{user?.accountStatus}</td>
            </tr>

            {user?.role === "Student" && (
              <>
                <tr>
                  <th>Roll Number</th>
                  <td>{user?.rollNumber}</td>
                </tr>

                <tr>
                  <th>Batch</th>
                  <td>{user?.batch?.name} ({user?.batch?.startingYear} - {user?.batch?.endingYear})</td>
                </tr>

                <tr>
                  <th>Departement</th>
                  <td>{user?.departement?.name}</td>
                </tr>
              </>
            )}
          </table>
        </div>
      </div>

      <Modal title="Update Image" show={show} onClose={handleCloseModel}>
        <div className="avatar">
          <img src={image} alt="not found" />
        </div>
        <form action="">
          <input type="file" id="image" onChange={captureImage} required />
          <label htmlFor="image" className="text__primary">
            Choose another image
          </label>
        </form>

        <div className="actions">
          <button className="btn btn__danger" onClick={handleCloseModel}>
            CANCEL
          </button>
          <button className="btn btn__success" onClick={handleUpdate}>
            UPDATE
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
