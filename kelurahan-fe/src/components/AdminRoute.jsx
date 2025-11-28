import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";

const AdminRoute = () => {
  const { user } = useAuth();

  if (user && user.role === "petugas") {
    return <AdminLayout />;
  }

  return <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
