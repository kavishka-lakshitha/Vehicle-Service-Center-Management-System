// src/Pages/updateEmployee/update.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './Update.css';
import { IoChevronBackOutline } from "react-icons/io5";

const Update = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    address: '',
    nic: '',
    dateOfJoin: '',
    email: '',
    contactNumber: '',
    role: ''
  });

  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');

  useEffect(() => {
    const fetchemployee = async () => {
      try {
        const userDoc = doc(db, 'employees', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setFormData(userSnapshot.data());
        } else {
          console.error('No such employee!');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchemployee();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      if (!/^\d*$/.test(value)) return; 
      if (value.length > 10) return; 
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const { firstName, lastName, address, email, contactNumber, role } = formData;

    if (!firstName || !lastName || !address || !email || !role || !contactNumber) {
      setMessage('Please fill in all the fields.');
      setSeverity('error');
      setSnackbarOpen(true);
      return false;
    }

    if (contactNumber.length !== 10 || !contactNumber.startsWith('0')) {
      setMessage('Invalid Contact number');
      setSeverity('error');
      setSnackbarOpen(true);
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      setMessage('Invalid email format.');
      setSeverity('error');
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      contactNumber: '',
      role: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userDoc = doc(db, 'employees', userId);
      await updateDoc(userDoc, formData);
      setMessage('User updated successfully!');
      setSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate('/EmployeeManage');
      }, 3000);
    } catch (error) {
      console.error('Error updating employee:', error);
      setMessage('Failed to update user. Please try again.');
      setSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className="updateEmployee-header">
        <h2>Update Employee</h2>
      </div>
      <div className="form2">
        <form onSubmit={handleSubmit} className="updateEmployee-form">
          <div className="formEmp-update-row">
            <div className="formEmp-update-group">
              <label htmlFor="employeeID">Employee ID :</label>
              <input
                type="text"
                id="employeeID"
                name="employeeID"
                value={formData.employeeId}
                readOnly 
              />
            </div>
            <div className="formEmp-update-group">
              <label htmlFor="nic">NIC :</label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={formData.nic}
                readOnly 
              />
            </div>
            <div className="formEmp-update-group">
              <label htmlFor="firstName">First Name :</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
              />
            </div>
            <div className="formEmp-update-group">
              <label htmlFor="lastName">Last Name :</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
              />
            </div>
          </div>

          <div className="formEmp-update-row">
            <div className="formEmp-update-group">
              <label htmlFor="email">Email :</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
              />
            </div>
            
            <div className="formEmp-update-group">
              <label htmlFor="contactNumber">Contact Number :</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter Contact Number"
              />
            </div>
            <div className="formEmp-update-group">
              <label htmlFor="role">Role :</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">--- Select ---</option>
                <option value="online">Online Employee</option>
                <option value="physical">Physical Employee</option>
                <option value="road">Road Assistance</option>
              </select>
            </div>
            <div className="formEmp-update-group">
              <label htmlFor="dateOfJoin">Date of Join :</label>
              <input
                type="date"
                id="dateOfJoin"
                name="dateOfJoin"
                value={formData.dateOfJoin}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="formEmp-update-group full-width">
              <label htmlFor="address">Address :</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
              />
            </div>
          </div>

          <div className="formEmp-update-actions">
            <button type="button" className="ebtn-clear" onClick={handleClear}>
              Clear
            </button>
            <button type="submit" className="ebtn-update">
              Update
            </button>
            <button type="button" className="eback-button" onClick={() => navigate('/manage-employees')}>
              <IoChevronBackOutline /> Back
            </button>
          </div>
        </form>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} className={severity === 'success' ? 'Alert-success' : 'Alert-error'}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Update;
