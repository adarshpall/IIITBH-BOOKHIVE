import "./countCard.scss";
import {Link} from "react-router-dom";


const CountCard = ({heading,count,link}) => {
  return (
    <div className="bg__accent count__card">
      <h4>{heading}</h4>
      <h2>{count}</h2>
      <Link className="text__primary link" to={link}>View All</Link>
    </div>
  );
};

export default CountCard;
