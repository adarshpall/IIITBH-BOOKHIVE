import "./sidebar.scss";
import profileImage from "../../../assets/avatar.svg";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, logout } from "../../../http";
import { setAuth } from "../../../store/slices/authSlice";
import { FiLogOut } from "react-icons/fi";

function SideBar({ open, setOpen, menu }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const { data } = await logout();
      dispatch(setAuth(data));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className={`sidebar bg__accent text__color ${open && "sidebar__active"}`}
    >
      <div className="sidebar__content">
        {/* close button */}
        <button
          className="btn__close text__color"
          onClick={() => {
            setOpen(!open);
          }}
        >
          &times;
        </button>
        <div className="user-info">
          <img
            src={
              user.imagePath ? `${BASE_URL}/${user.imagePath}` : profileImage
            }
            alt="Profile Image"
          />
          <span className="username">{user.name}</span>
          <span className="role text__primary">({user.role})</span>
        </div>
        <div className="list">
          {menu?.map((i) => (
            <div key={i.id}>
              <span className="list__title">{i?.title}</span>
              {i?.listItems?.map((j) => (
                <NavLink
                  to={j.link}
                  className="list__item text__color"
                  key={j.id}
                >
                  <span className="icon">{j.icon}</span>
                  <span className="text">{j.text}</span>
                </NavLink>
              ))}
            </div>
          ))}
          <Link
            to="#"
            className="list__item text__color"
            onClick={handleLogout}
          >
            <span className="icon">
              <FiLogOut />
            </span>
            <span className="text">Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
