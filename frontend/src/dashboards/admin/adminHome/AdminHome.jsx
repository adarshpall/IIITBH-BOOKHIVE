import "./adminhome.scss";
import { BarChart, CountCard, Loader, PieChart } from "../../../components";
import { useEffect, useState } from "react";
import { STATUSES, getAdminDashboardStats } from "../../../http";
import { formatDate } from "../../../utils/formatDate";

const AdminHome = () => {
  const [status, setStatus] = useState(STATUSES.IDLE);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setStatus(STATUSES.LOADING);
    try {
      const { data } = await getAdminDashboardStats();
      setData(data);
      console.log(data);
      setStatus(STATUSES.IDLE);
    } catch (error) {
      console.log(error);
      setStatus(STATUSES.ERROR);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (status === STATUSES.LOADING) {
    return <Loader />;
  }

  return (
    <div className="user__home__container">
      {/* COUNTER CARDS */}
      <div className="card__wrapper">
        <CountCard
          heading={"Total Books"}
          count={data?.numberOfTotalBooks}
          link={"manage-books"}
        />
        <CountCard
          heading={"Issued Books"}
          count={data?.numberOfBorrowedBooks}
          link={"manage-issued-books"}
        />
        <CountCard
          heading={"Reserved Books"}
          count={data?.numberOfReservedBooks}
          link={"reserved-books-list"}
        />
        <CountCard
          heading={"Total Ebooks"}
          count={data?.numberOfEBooks}
          link={"manage-ebooks"}
        />
      </div>

      {/* BAR AND PIE CHART */}
      <div className="chart__wrapper">
        <div className="barchart__container">
          <BarChart
            title="NUMBER OF BORROWED BOOKS CHART"
            labels={
              data?.last12MonthsData &&
              Object.keys(data?.last12MonthsData).reverse()
            }
            values={
              data?.last12MonthsData &&
              Object.values(data?.last12MonthsData).reverse()
            }
            label="BORROWED BOOKS"
          />
        </div>
        <div className="piechart__container">
          <PieChart
            labels={data?.statusCounts && Object.keys(data?.statusCounts)}
            values={data?.statusCounts && Object.values(data?.statusCounts)}
            title={"BOOK STATUS  CHART"}
            label="STATUS"
          />
        </div>
      </div>

      {/* LAST 5 ISSUED BOOKS */}
      <h2 style={{ textTransform: "uppercase", fontWeight: "400" }}>
        Last 5 Issued Books
      </h2>
      <div className="table__wrapper bg__accent">
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr className="bg__secondary">
              <td>No#</td>
              <td>Member Name</td>
              <td>Book Title</td>
              <td>Issued Date</td>
              <td>Due Date</td>
            </tr>
          </thead>
          <tbody>
            {data?.last5IssuedBooks?.map((transaction, index) => {
              return (
                <tr key={transaction._id}>
                  <td>{index + 1}</td>
                  <td>{transaction.user.name}</td>
                  <td>{transaction.book.title}</td>
                  <td>{formatDate(transaction.borrowDate)}</td>
                  <td>{formatDate(transaction.dueDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* LAST 5 RETURNED BOOKS */}
      <h2
        style={{
          textTransform: "uppercase",
          fontWeight: "400",
          marginTop: "10px",
        }}
      >
        Last 5 Returned Books
      </h2>
      <div className="table__wrapper bg__accent">
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr className="bg__secondary">
              <td>No#</td>
              <td>Member Name</td>
              <td>Book Title</td>
              <td>Issued Date</td>
              <td>Returned Date</td>
            </tr>
          </thead>
          <tbody>
            {data?.last5ReturnedBooks?.map((transaction, index) => {
              return (
                <tr key={transaction._id}>
                  <td>{index + 1}</td>
                  <td>{transaction.user.name}</td>
                  <td>{transaction.book.title}</td>
                  <td>{formatDate(transaction.borrowDate)}</td>
                  <td>{formatDate(transaction.returnedDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHome;
