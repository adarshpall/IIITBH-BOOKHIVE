import profileImage from "../../../assets/avatar.svg";
import { useState } from "react";
import { BASE_URL, getUserDetails } from "../../../http";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const UserDetail = () => {
  const [user, setUser] = useState({});
  const {_id} = useParams();
  const fetchUserDetails = async ()=>{
    try {
        const {data} = await getUserDetails(_id);
        setUser(data?.user)
        setImage( data?.user?.imagePath ? `${BASE_URL}/${data?.user?.imagePath}` : profileImage)
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, [])
  
  const [image, setImage] = useState(
    user?.imagePath ? `${BASE_URL}/${user?.imagePath}` : profileImage
  );

  return (
    <div className="profile__wrapper bg">
      <div className="profile__container bg__accent">
        <div className="avatar">
          <img src={image} alt="not found" />
        </div>

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
                  <td>
                    {user?.batch?.name} ({user?.batch?.startingYear} -{" "}
                    {user?.batch?.endingYear})
                  </td>
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
    </div>
  );
};

export default UserDetail;
