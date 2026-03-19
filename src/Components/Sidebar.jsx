import React, { useState } from 'react';
import { LuUsers2 } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { HiOutlineDocumentReport } from "react-icons/hi";
import {  MdManageHistory } from "react-icons/md";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, Tooltip } from '@mui/material';
import { BiHome, BiUser, BiMessage} from 'react-icons/bi';
import { Link } from 'react-router-dom';
import './styles.css'; // Import custom styles
import logo from "../assets/logo.png";
import { CiBookmarkRemove } from "react-icons/ci";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';


const Sidebar = ({ isSidebarOpen, onToggleSidebar }) => {
  const [openEmployees, setOpenEmployees] = useState(false);
  const [openReservations, setOpenReservations] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  const handleClick = (setStateFunction) => () => setStateFunction(prev => !prev);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    // Clear authentication tokens or any other relevant data
    // For example:
    localStorage.removeItem('authToken');
    // Redirect to login page
    window.location.href = '/login'; // or use useNavigate if using React Router v6+
    setOpenLogoutDialog(false);
  };
  
  
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  
  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };
  

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isSidebarOpen ? 250 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isSidebarOpen ? 250 : 80,
          height: '100vh', // Set full viewport height
          display: 'flex', // Flexbox to manage layout
          flexDirection: 'column', // Vertical stacking
          background: '#1F3B4D',
          color: '#ecf0f1',
          overflowY: 'auto', // Enable vertical scrolling
          overflowX: 'hidden', // Disable horizontal scrolling
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
      className="sidebar"
    >
      <div className="logowrapper">
        <Link to={'/'} className="d-flex align-items-center">
          <img src={logo} alt="Logo" />
        </Link>
        <span>Ananda Auto Motor<br /> Techniques</span>
      </div>
      <List className="sidebar-list">
        {/* Dashboard Section */}
        <Tooltip title={isSidebarOpen ? "" : "Dashboard"} arrow>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button className="sidebar-item">
              <ListItemIcon>
                <BiHome style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
            </ListItem>
          </Link>
        </Tooltip>

        {/* Users Section */}
        <Tooltip title={isSidebarOpen ? "" : "Users"} arrow>
          <ListItem button className="sidebar-item" onClick={handleClick(setOpenUsers)}>
            <ListItemIcon>
              <BiUser style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
            </ListItemIcon>
            <ListItemText primary="Users" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
          </ListItem>
        </Tooltip>
        <Collapse in={openUsers && isSidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button sx={{ pl: 9 }} className="sidebar-item">
                <ListItemText primary="Manage users" />
              </ListItem>
            </Link>
          </List>
        </Collapse>

        {/* Employees Section */}
        <Tooltip title={isSidebarOpen ? "" : "Employees"} arrow>
          <ListItem button className="sidebar-item" onClick={handleClick(setOpenEmployees)}>
            <ListItemIcon>
              <LuUsers2 style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
            </ListItemIcon>
            <ListItemText primary="Employees" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
          </ListItem>
        </Tooltip>
        <Collapse in={openEmployees && isSidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/employee-registration" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button sx={{ pl: 9 }} className="sidebar-item">
                <ListItemText primary="Registration" />
              </ListItem>
            </Link>
            <Link to="/manage-employees" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button sx={{ pl: 9 }} className="sidebar-item">
                <ListItemText primary="Manage Employees" />
              </ListItem>
            </Link>
          </List>
        </Collapse>

        {/* Reservations Section */}
        <Tooltip title={isSidebarOpen ? "" : "Reservation"} arrow>
          <Link to="/Reservation" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button className="sidebar-item">
              <ListItemIcon>
                <BiMessage style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
              </ListItemIcon>
              <ListItemText primary="Reservation" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
            </ListItem>
          </Link>
        </Tooltip>

 {/* Reject Reservations */}
 <Tooltip title={isSidebarOpen ? "" : "Reject"} arrow>
          <Link to="/reject_reservation" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button className="sidebar-item">
              <ListItemIcon>
                <CiBookmarkRemove style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
              </ListItemIcon>
              <ListItemText primary="Reject Reservations" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
            </ListItem>
          </Link>
        </Tooltip>

        {/* Feedback Section */}
        <Tooltip title={isSidebarOpen ? "" : "Review"} arrow>
          <Link to="/Review" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button className="sidebar-item">
              <ListItemIcon>
                <VscFeedback style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
              </ListItemIcon>
              <ListItemText primary="Review" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
            </ListItem>
          </Link>
        </Tooltip>

        {/* Service History Section */}
        <Tooltip title={isSidebarOpen ? "" : "Service History"} arrow>
          <Link to="/serviceHistory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button className="sidebar-item">
              <ListItemIcon>
                <MdManageHistory style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
              </ListItemIcon>
              <ListItemText primary="Service History" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
            </ListItem>
          </Link>
        </Tooltip>

        {/* Reports Section */}
        <Tooltip title={isSidebarOpen ? "" : "Reports"} arrow>
          <ListItem button className="sidebar-item" onClick={handleClick(setOpenReport)}>
            <ListItemIcon>
              <HiOutlineDocumentReport style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
            </ListItemIcon>
            <ListItemText primary="Reports" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
          </ListItem>
        </Tooltip>
        <Collapse in={openReport && isSidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/report/generate" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button sx={{ pl: 9 }} className="sidebar-item">
                <ListItemText primary="Service Types" />
              </ListItem>
            </Link>
            <Link to="/report/view" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button sx={{ pl: 9 }} className="sidebar-item">
                <ListItemText primary="Vehicle Types " />
              </ListItem>
            </Link>
          </List>
        </Collapse>

       {/* Logout Button */}
       <Tooltip title={isSidebarOpen ? "" : "Logout"} arrow>
          <ListItem button onClick={handleLogoutClick} className="sidebar-item">
            <ListItemIcon>
              <ExitToAppIcon style={{ color: '#ecf0f1', fontSize: isSidebarOpen ? 24 : 16 }} />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ display: isSidebarOpen ? 'block' : 'none' }} />
          </ListItem>
        </Tooltip>
      </List>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={openLogoutDialog}
                onClose={handleLogoutCancel}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                sx={{ backdropFilter: 'blur(4px)' }}
            >
                <DialogTitle 
                    id="logout-dialog-title" 
                    sx={{
                        backgroundColor: '#2C3E50', 
                        color: '#FFFFFF', 
                        fontSize: 18, 
                        fontWeight: 700,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6">Confirm Logout</Typography>
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#30545f'}}>
                    <DialogContentText
                        id="logout-dialog-description" 
                        sx={{
                            color: '#FFFFFF', 
                            fontSize: 16, 
                            textAlign: 'left', 
                            fontWeight: 200,
                            marginTop:'10px'
                        }}
                    >
                        Are you sure you want to log out? You will need to log in again to access your account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2C3E50' }}>
                    <Button
                        onClick={handleLogoutCancel}
                        color="inherit"
                        variant="outlined"
                        sx={{
                            marginTop:'10px',
                            marginBottom:'10px',
                            fontSize: 14, 
                            fontWeight: 600, 
                            padding: '8px 30px', 
                            borderColor: '#ecf0f1',
                            color: '#ecf0f1',
                            '&:hover': {
                                borderColor: '#95a5a6',
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        color="secondary"
                        variant="contained"
                        sx={{
                            marginTop:'10px',
                            marginBottom:'10px',
                            fontSize: 14, 
                            fontWeight: 600, 
                            padding: '8px 30px', 
                            backgroundColor: '#e74c3c', 
                            '&:hover': {
                                backgroundColor: '#c0392b',
                            },
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
    </Drawer>
  );
};

export default Sidebar;