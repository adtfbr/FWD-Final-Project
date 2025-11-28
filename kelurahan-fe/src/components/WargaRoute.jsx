import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserLayout from "../layouts/UserLayout";

const WargaRoute = () => {
  const { user } = useAuth();

  if (user && user.role === "warga") {
    return <UserLayout />;
  }

  return <Navigate to="/login" replace />;
};

export default WargaRoute;
