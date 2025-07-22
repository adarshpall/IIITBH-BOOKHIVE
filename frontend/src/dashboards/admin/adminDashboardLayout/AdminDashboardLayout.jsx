import React from "react";
import { MdCancel, MdDashboard, MdPendingActions } from "react-icons/md";
import {
  FaBook,
  FaList,
  FaLock,
  FaUserAlt,
  FaUsers,
  FaBookOpen,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { BiCategoryAlt } from "react-icons/bi";
import { SiBookstack } from "react-icons/si";
import { useState } from "react";
import { AppBar, SideBar } from "../../../components";
import { Outlet } from "react-router-dom";
import { AiFillBell, AiFillMessage } from "react-icons/ai";

const menu = [
  {
    id: 1,
    title: "Core",
    listItems: [
      {
        id: 1,
        text: "Dashbaord",
        link: "/admin/dashboard",
        icon: <MdDashboard />,
      },
    ],
  },
  {
    id: 5,
    title: "Transaction",
    listItems: [
      {
        id: 1,
        text: "Issued Books",
        link: "manage-issued-books",
        icon: <SiBookstack />,
      },
      {
        id: 2,
        text: "Reserved Books",
        link: "reserved-books-list",
        icon: <SiBookstack />,
      },
      {
        id: 3,
        text: "Returned Books",
        link: "returned-books-list",
        icon: <SiBookstack />,
      },
      {
        id: 4,
        text: "Renew Books",
        link: "manage-renew-requests",
        icon: <FaBookOpen />,
      },
    ],
  },
  {
    id: 2,
    title: "Users",
    listItems: [
      {
        id: 1,
        text: "Students",
        link: "manage-students",
        icon: <FaUsers />,
      },
      {
        id: 2,
        text: "Teachers",
        link: "manage-teachers",
        icon: <FaUsers />,
      },
      {
        id: 3,
        text: "Batches",
        link: "manage-batches",
        icon: <FaBook />,
      },
      {
        id: 4,
        text: "Departements",
        link: "manage-departements",
        icon: <BiCategoryAlt />,
      },
    ],
  },
  {
    id: 3,
    title: "Books",
    listItems: [
      {
        id: 1,
        text: "Books",
        link: "manage-books",
        icon: <FaBook />,
      },
      {
        id: 4,
        text: "EBooks",
        link: "manage-ebooks",
        icon: <FaBook />,
      },
      {
        id: 2,
        text: "Categories",
        link: "manage-categories",
        icon: <BiCategoryAlt />,
      },
      {
        id: 3,
        text: "Almirahs",
        link: "manage-almirahs",
        icon: <FaList />,
      },
    ],
  },
  {
    id: 6,
    title: "Clearance Requests",
    listItems: [
      {
        id: 1,
        text: "Pending",
        link: "manage-clearance-form/Pending",
        icon: <MdPendingActions />,
      },
      {
        id: 2,
        text: "Approved",
        link: "manage-clearance-form/Approved",
        icon: <FcApproval />,
      },

      {
        id: 3,
        text: "Rejected",
        link: "manage-clearance-form/Rejected",
        icon: <MdCancel />,
      },
    ],
  },

  {
    id: 7,
    title: "Account",
    listItems: [
      {
        id: 1,
        text: "Profile",
        link: "profile",
        icon: <FaUserAlt />,
      },

      {
        id: 4,
        text: "Messages",
        link: "manage-messages",
        icon: <AiFillMessage />,
      },

      {
        id: 3,
        text: "Change Password",
        link: "change-password",
        icon: <FaLock />,
      },
    ],
  },
];

const AdminDashboardLayout = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="dashboard__layout">
      <SideBar menu={menu} open={open} setOpen={setOpen} />
      <div className="container bg">
        <AppBar open={open} setOpen={setOpen} />
        <main className="bg text__color">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
