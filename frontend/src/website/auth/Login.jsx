import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { STATUSES, login } from "../../http";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuth } from "../../store/slices/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState(STATUSES.IDLE);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setStatus(STATUSES.LOADING);
      const { data } = await login(formData);
      dispatch(setAuth(data));
      setStatus(STATUSES.IDLE);
      /* REDIRECT TO DASHBOARD ACCORDING TO ROLE */
      if (data?.user?.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
      toast.success(`Welcome back! ${data?.user?.name}`);
    } catch (error) {
      setStatus(STATUSES.ERROR);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }

  return (
    <div className="bg text__color auth__card__wrapper">
      <div className="auth__card__container">
        <div className="heading">
          <h1>LOGIN</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control password__input ">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {showPassword ? (
              <AiOutlineEyeInvisible
                className="show__password__icon"
                onClick={() => {
                  setShowPassword(false);
                }}
              />
            ) : (
              <AiOutlineEye
                className="show__password__icon"
                onClick={() => {
                  setShowPassword(true);
                }}
              />
            )}
          </div>
          <button
            type="submit"
            className="btn btn__primary"
            disabled={status === STATUSES.LOADING}
          >
            {status === STATUSES.LOADING ? (
              <div className="loader"></div>
            ) : (
              "Submit"
            )}
          </button>
          <Link to="/forget-password" className="text__color">
            Forget Password ?{" "}
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
