import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // User is not authenticated, redirect to login page
        return <Navigate to="/login" />;
    }

    // User is authenticated, render the children components
    return <>{children}</>;
};

export default ProtectedRoute;
