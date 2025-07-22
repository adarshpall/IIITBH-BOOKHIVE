import { useState } from "react";
import "./changePassword.scss";
import { changePassword } from "../../../http";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promise = changePassword({
      newPassword: formData.newPassword,
      currentPassword: formData.currentPassword,
    });

    toast.promise(promise, {
      loading: "Changing Password....",
      success: (data) => {
            setFormData({newPassword:"",currentPassword:""});
            return "Password Changed Successfully";
      },
      error: (err) => {
        console.log(err);
        return `${err?.response?.data?.message}`;
      },
    });
  };
  return (
    <div className="changepassword__wrapper">
      <div className="heading">
        <h1>Change Password</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-control password__input ">
          <label htmlFor="password">Current Password</label>
          <input
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
          {showCurrentPassword ? (
            <AiOutlineEyeInvisible
              className="show__password__icon"
              onClick={() => {
                setShowCurrentPassword(false);
              }}
            />
          ) : (
            <AiOutlineEye
              className="show__password__icon"
              onClick={() => {
                setShowCurrentPassword(true);
              }}
            />
          )}
        </div>
        <div className="form-control password__input ">
          <label htmlFor="password">New Password</label>
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          {showNewPassword ? (
            <AiOutlineEyeInvisible
              className="show__password__icon"
              onClick={() => {
                setShowNewPassword(false);
              }}
            />
          ) : (
            <AiOutlineEye
              className="show__password__icon"
              onClick={() => {
                setShowNewPassword(true);
              }}
            />
          )}
        </div>
        <button className="btn btn__secondary">CHANGE PASSWORD</button>
      </form>
    </div>
  );
};

export default ChangePassword;
