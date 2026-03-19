import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path if necessary
import './UpdateUsers.css'; // Add your custom CSS here
import { IoChevronBackOutline } from "react-icons/io5";
import { Snackbar, Alert } from '@mui/material';

const UpdateUsers = () => {
  const { nic } = useParams();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    vehicles: [], 
    selectedVehicle: '', 
    firstName: '',
    lastName: '',
    address: '',
    nic: '',
    email: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(true); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');

  const fetchUser = async () => {
    try {
      const userDoc = doc(db, 'userDetails', nic);
      const userSnapshot = await getDoc(userDoc);
  
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        console.log('Fetched user data:', data);

        setFormData({
          vehicles: data.vehicles?.map(vehicle => vehicle.vehicleNumber) || [],
          selectedVehicle: data.vehicles?.[0]?.vehicleNumber || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          address: data.address || '',
          nic: data.nic || '',
          email: data.email || '',
          contactNumber: data.contact || '',
        });
      } else {
        console.error('No such user!');
        setErrorMessage('No user found with the provided NIC.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message); 
      setErrorMessage('Error fetching user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); 
  }, [nic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClear = () => {
    setFormData({
      vehicles: formData.vehicles,  
      selectedVehicle: formData.selectedVehicle, 
      firstName: '',
      lastName: '',
      address: '',
      nic: formData.nic,  
      email: '',
      contactNumber: ''
    });
    setErrorMessage('');  
  };

  const validateContactNumber = (contactNumber) => {
    
    const isValid = /^0\d{9}$/.test(contactNumber);
    return isValid;
  };
  
  const validateEmail = (email) => {
    
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.address || !formData.email || !formData.contactNumber) {
      setMessage('Please fill in all the fields.');
      setSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!validateContactNumber(formData.contactNumber)) {
      setMessage('Invalid contact number.Please enter a valid contact number.');
      setSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!validateEmail(formData.email)) {
      setMessage('Invalid email address .Please enter a valid email.');
      setSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const userDoc = doc(db, 'userDetails', nic);

      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        email: formData.email,
        contactNumber: formData.contactNumber
      };

      await updateDoc(userDoc, updatedData);
      setMessage('User updated successfully!');
      setSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        setSnackbarOpen(false);
        navigate('/users');
      }, 3000);
    } catch (error) {
      setMessage('Error updating user. Please try again.');
      setSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className="update-header">
        <h2>Update User</h2>
      </div>
      <div className="form1">
        <form onSubmit={handleSubmit} className="updateuser-form1">
          <div className="formuser-row">
            <div className="formuser-group">
              <label htmlFor="nic">NIC :</label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="Enter NIC"
                readOnly
              />
            </div>

            <div className="formuser-group">
              <label htmlFor="vehicleNumber">Vehicle Number :</label>
              <textarea
                className="textselectVehicle" 
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicles.join("\n")} 
                readOnly 
                rows={formData.vehicles.length || 3} 
              />
            </div>

            <div className="formuser-group">
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
            <div className="formuser-group">
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

          <div className="formuser-row">
            <div className="formuser-group">
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

            <div className="formuser-group">
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
          </div>

          <div className="formuser-group full-width">
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
          <div className="formuser-actions">
            <button type="button" className="ubtn-clear" onClick={handleClear}>Clear</button>
            <button type="submit" className="ubtn-update">Update</button>
            <button type="button" className="uback-button" onClick={() => navigate('/Users')}>
              <IoChevronBackOutline /> Back
            </button>
          </div>
        </form>
        
     
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={severity} className={severity === 'success' ? 'Alert-success' : 'Alert-error'}>
            {message}
          </Alert>
        </Snackbar>
        
        {successMessage && <div className="Alert-success">{successMessage}</div>}
        {errorMessage && <div className="Alert-error">{errorMessage}</div>}
      </div>
    </>
  );
};

export default UpdateUsers;
