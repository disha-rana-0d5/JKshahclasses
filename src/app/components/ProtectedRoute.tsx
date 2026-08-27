import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token) {
        // Redirect to appropriate login page based on route
        const isAdminRoute = location.pathname.startsWith("/admin");
        if (isAdminRoute) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        window.location.href = "https://new-online.jkshahclasses.com/";
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // If user role is not allowed, redirect to appropriate login page to switch account
        const isAdminRoute = location.pathname.startsWith("/admin");
        if (isAdminRoute) {
            return <Navigate to="/admin/login" replace />;
        }
        window.location.href = "https://new-online.jkshahclasses.com/";
        return null;
    }

    return <>{children}</>;
};
