import { Outlet } from "react-router-dom";
import { Footer, Header } from "../../components";

const WebsiteLayout = () => {
  return (
    <div className="bg">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
