import "./header.scss";
import { BiPhoneCall } from "react-icons/bi";
import { AiOutlineClose, AiOutlineMail } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegUserCircle, FaRegMoon } from "react-icons/fa";
import { GiBookAura } from "react-icons/gi";
import { AiOutlineMenu } from "react-icons/ai";
import { FiSun } from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../../store/slices/themeSlice";
import { useState } from "react";
import { BASE_URL, logout } from "../../../http";
import { setAuth } from "../../../store/slices/authSlice";
import profileImage from "../../../assets/avatar.svg";

const Header = () => {
  const { theme } = useSelector((state) => state.theme);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      const { data } = await logout();
      dispatch(setAuth(data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header>
      <div className="topbar bg__secondary text__color">
        <span>Discover, Learn, Thrive: Dive into our Library!</span>
        <div>
          <BiPhoneCall />
          <span>076329 95210</span>
          <AiOutlineMail />
          <span> academicaffairs688@gmail.com</span>
        </div>
      </div>

      <nav className="bg__accent">
        <div className="logo text__primary">
          <GiBookAura className="logo__icon" />
          <span>BOOKHIVE IIITBH</span>
        </div>
        <div className="center">
          <NavLink to="/" className="text__color ">
            Home
          </NavLink>
          <NavLink to="/books" className="text__color ">
            Books
          </NavLink>
          <NavLink to="/ebooks" className="text__color ">
            EBooks
          </NavLink>
          <NavLink to="/about-us" className="text__color ">
            About Us
          </NavLink>
          <NavLink to="/contact-us" className="text__color ">
            Contact Us
          </NavLink>
        </div>
        <div className="right">
          <button
            className="btn__icon text__color "
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {theme === "dark" ? <FaRegMoon /> : <FiSun />}
          </button>
          {auth?.isAuth ? (
            <div
              className="profile text__color"
              onClick={() => {
                setOpenDropdown(!openDropdown);
              }}
            >
              <img
                src={
                  auth?.user.imagePath
                    ? `${BASE_URL}/${auth?.user.imagePath}`
                    : profileImage
                }
                alt="Profile Image"
              />
              <span className="name">{auth?.user?.name}</span>

              <div
                className={`dropdown__wrapper bg__accent ${
                  openDropdown && "dropdown__wrapper__active"
                }`}
              >
                <div className="dropdown__content">
                  <Link
                    to={
                      auth?.user?.role === "Admin"
                        ? "/admin/dashboard"
                        : "/user/dashboard"
                    }
                    className="dropdown__item text__color"
                  >
                    <FaRegUserCircle className="icon" />
                    <span className="text">Dashboard</span>
                  </Link>
                  <Link
                    to={
                      auth?.user?.role === "Admin"
                        ? "/admin/dashboard/change-password"
                        : "/user/dashboard/change-password"
                    }
                    className="dropdown__item text__color"
                  >
                    <RiLockPasswordLine className="icon" />
                    <span className="text">Change Password</span>
                  </Link>
                  <Link
                    to="/"
                    className="dropdown__item text__color"
                    onClick={handleLogout}
                  >
                    <BiLogOut className="icon" />
                    <span className="text">Logout</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Link className="btn btn__primary btn__login" to="/login">
              Login
            </Link>
          )}
        </div>

        {/* MOBILE RIGHT */}
        <div className="mobile__right">
          <button
            className="btn__icon text__color "
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {theme === "dark" ? <FaRegMoon /> : <FiSun />}
          </button>
          <button
            className="btn__icon text__color"
            onClick={() => {
              setMobileMenuOpen(true);
            }}
          >
            <AiOutlineMenu />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`mobile__nav__wrapper ${
            mobileMenuOpen && "mobile__nav__wrapper__active"
          }  bg `}
        >
          {/* Close button */}
          <button className="btn__icon text__color btn__close">
            <AiOutlineClose
              className="icon"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            />
          </button>
          <nav>
            <Link
              to="/"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text__color "
            >
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text__color "
            >
              Books
            </Link>
            <Link
              to="/ebooks"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text__color "
            >
              eBooks
            </Link>
            <Link
              to="/about-us"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text__color "
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text__color "
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </nav>
    </header>
  );
};

export default Header;
