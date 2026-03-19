import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './Navbar.css';
import Button from '@mui/material/Button';
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { IoIosMail } from "react-icons/io";
import profile from '../assets/profile.jpg';
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 

const Navbar = ({ isSidebarOpen, onToggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const navigate = useNavigate(); 

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode); 
  };

  const handleProfileClick = () => {
    navigate("/profile");  
  };

  return (
    <header className={`header ${isSidebarOpen ? 'header-expanded' : 'header-collapsed'}`}>
      <div className="container-fluid w-100">
        <div className="row d-flex align-items-center w-100">
          <div className="col-sm-3 d-flex align-items-center part2 pl-4">
            <Button style={{ marginLeft: '10px' }} className="rounded-circle" onClick={onToggleSidebar}>
              <FiMenu />
            </Button>
          </div>
          <div className="col-sm-6 d-flex align-items-center justify-content-end part3">
            <Button className="rounded-circle custom-margin" onClick={toggleDarkMode}>
              {isDarkMode ? <MdOutlineDarkMode /> : <MdOutlineLightMode />}
            </Button>
            <Button className="rounded-circle custom-margin" onClick={() => window.location.href = 'mailto:anandaautomoters@gmail.com'}>
              <IoIosMail />
            </Button>
            
           
            <Button className="myAccWrapper" onClick={handleProfileClick}>
              <div className="myAcc userImg rounded-circle">
                <img src={profile} alt="Profile" />
              </div>
            </Button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
