import "./userhome.scss";
import { BarChart, CountCard, Loader, PieChart } from "../../../components";
import { useEffect, useState } from "react";
import { STATUSES, getUserDashboardStats } from "../../../http";

const UserHome = () => {
  const [status, setStatus] = useState(STATUSES.IDLE);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setStatus(STATUSES.LOADING);
    try {
      const { data } = await getUserDashboardStats();
      setData(data);
      // console.log(data);
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
          heading={"Borrowed Books"}
          count={data?.numberOfBorrowedBooks}
          link={"borrowed-books"}
        />
        <CountCard
          heading={"Reserved Books"}
          count={data?.numberOfReservedBooks}
          link={"reserved-books"}
        />
        <CountCard
          heading={"Returned Books"}
          count={data?.numberOfReturnedBooks}
          link={"returned-books"}
        />
        <CountCard
          heading={"Overdue Books"}
          count={data?.numberOfOverDueBooks}
          link={"borrowed-books"}
        />
      </div>

      {/* BAR CHART */}
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
            labels={
              data?.categoryCounts &&
              Object.keys(data?.categoryCounts).reverse()
            }
            values={data?.categoryCounts && Object.values(data?.categoryCounts)}
            title={"CATEGORY DISTRIBUATION CHART"}
            label="BORROWED BOOKS"
          />
        </div>
      </div>
    </div>
  );
};

export default UserHome;
