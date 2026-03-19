import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import Dashboard from './Pages/Dashboard';
import EmployeeManage from './Pages/EmployeeManage';
import EmployeeRegistration from './Pages/EmployeeRegistration';
import Users from './Pages/Users';
import LoginPage from './Pages/LoginPage';
import './App.css'; // Ensure to include your CSS for layout
import UpdateUsers from './Pages/UpdateUsers';
import Update from './Pages/updateEmployee/update';
import Reservation from './Pages/Reservations/Reservation';
import Details from './Pages/Reservations/Details';
import UpdateReservation from './Pages/Reservations/UpdateReservation';
import Email from './Pages/Alters/Email';
import Sms from './Pages/Alters/Sms';
import ServiceHistory from './Pages/ServiceHistory/ServiceHistory';
import ServiceHistoryDetails from './Pages/ServiceHistory/serviceHistoryDetails';
import ServicesPage from './Pages/Service/servicesPage';
import CategoryServiceView from './Pages/Service/categoryServiceView';
import Reviews from './Pages/Reviews';
import Reject from './Pages/Reservations/Reject';
import Service_Type from './Pages/Report/Service_Type';
import Vehicle_Type from './Pages/Report/Vehicle_Type';
import UserProfile from './Pages/UserProfile';






function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Router>
            <div className={`app-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                {/* Conditionally render Navbar based on authentication */}
                {isAuthenticated && (
                    <>
                        <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={handleSidebarToggle} />
                        <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={handleSidebarToggle} />
                    </>
                )}
                <div className="main-content">
                    <div className="page-content">
                        <Routes>
                            {/* Login Route */}
                            <Route
                                path="/login"
                                element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
                            />

                            {/* Protect routes with isAuthenticated */}
                            {isAuthenticated ? (
                                <>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/users" element={<Users />} />
                                    <Route path="/updateuser/:nic" element={<UpdateUsers />} />
                                    <Route path="/employee-registration" element={<EmployeeRegistration />} />
                                    <Route path="/manage-employees" element={<EmployeeManage />} />
                                    <Route path="/update/:userId" element={<Update />} />
                                    <Route path="/Reservation" element={<Reservation />} />
                                    <Route path="/reservations/details/:id" element={<Details />} />
                                    <Route path="/UpdateReservation/:id"element={<UpdateReservation />} />
                                    <Route path="/alerts/email" element={<Email/>}/>
                                    <Route path="/alerts/sms" element={<Sms />} />
                                    <Route path="/serviceHistory" element={<ServiceHistory />} />
                                    <Route path="/serviceHistoryDetails/:id" element={<ServiceHistoryDetails />} />
                                    <Route path="/services" element={<ServicesPage/>} />
                                    <Route path="/categories" element={<CategoryServiceView/>}/>
                                    <Route path="/review" element={<Reviews/>}/>
                                    <Route path="/reject_reservation" element={<Reject/>}/>
                                    <Route path="/report/generate" element={<Service_Type/>}/> 
                                    <Route path="/report/view" element={<Vehicle_Type/>}/>
                                    <Route path="/profile" element={<UserProfile />} />

                                     {/* Logout Route */}
                                     <Route path="/logout" element={<Navigate to="/login" replace />} />
                                    
                                    {/* Redirect unknown paths to dashboard if authenticated */}
                                    <Route path="*" element={<Navigate to="/dashboard" />} />
                                </>
                            ) : (
                                <Route path="*" element={<Navigate to="/login" />} />
                            )}
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;
