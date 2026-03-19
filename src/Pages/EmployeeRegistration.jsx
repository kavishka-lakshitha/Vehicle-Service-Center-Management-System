import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './EmployeeRegistration.css';

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    nic: '',
    dateOfJoin: '',
    email: '',
    contactNumber: '',
    role: '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('');

  const handleSnackbar = (msg, sev) => {
    setMessage(msg);
    setSeverity(sev);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = async () => {
    if (!/^[0]\d{9}$/.test(formData.contactNumber)) {
      handleSnackbar('Contact number must be 10 digits and start with 0.', 'error');
      return false;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      handleSnackbar('Invalid email format.', 'error');
      return false;
    }


    if (!/^\d{9}[vV]$|^\d{12}$/.test(formData.nic)) {
      handleSnackbar('NIC must be 12 digits or 9 digits followed by "v".', 'error');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.dateOfJoin < today) {
      handleSnackbar('Date of joining cannot be in the past.', 'error');
      return false;
    }

    // Validate NIC uniqueness
    const isUniqueNIC = await validateNIC(formData.nic);
    if (!isUniqueNIC) {
      handleSnackbar('NIC already exists.', 'error');
      return false;
    }

    return true;
  };

  const validateNIC = async (nic) => {
    const employeesCollection = collection(db, 'employees');
    const q = query(employeesCollection, where('nic', '==', nic));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const employeesCollection = collection(db, 'employees');
      const querySnapshot = await getDocs(employeesCollection);
      let highestId = 0;

      querySnapshot.forEach((doc) => {
        const employeeId = doc.id;
        const numericId = parseInt(employeeId.split('-')[1], 10);
        if (numericId > highestId) highestId = numericId;
      });

      const newEmployeeId = `EMP-${String(highestId + 1).padStart(4, '0')}`;
      const newEmployee = {
        ...formData,
        employeeId: newEmployeeId,
        timestamp: serverTimestamp(),
      };

      const employeeDocRef = doc(db, 'employees', newEmployeeId);
      await setDoc(employeeDocRef, newEmployee);

      handleSnackbar('Employee registration successful!', 'success');
      setFormData({
        firstName: '',
        lastName: '',
        address: '',
        nic: '',
        dateOfJoin: '',
        email: '',
        contactNumber: '',
        role: '',
      });
    } catch (error) {
      handleSnackbar('Error registering employee. Please try again.', 'error');
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      nic: '',
      dateOfJoin: '',
      email: '',
      contactNumber: '',
      role: '',
    });
    setMessage('');
  };

  return (
    <>
      <div className="employee-header">
        <h2>Employee Registration</h2>
      </div>
      <div className="employee-form">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="formemployee-row">
            <div className="employee-form-group">
              <label htmlFor="firstName">First Name :</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter First Name"
              />
            </div>

            <div className="employee-form-group">
              <label htmlFor="lastName">Last Name :</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter Last Name"
              />
            </div>

            <div className="employee-form-group">
              <label htmlFor="address">Address :</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter Address"
              />
            </div>

            <div className="employee-form-group">
              <label htmlFor="nic">NIC :</label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                required
                placeholder="Enter NIC"
              />
            </div>
          </div>

          <div className="formemployee-row">
          <div className="employee-form-group">
  <label htmlFor="dateOfJoin">Date of Join :</label>
  <input
    type="date"
    id="dateOfJoin"
    name="dateOfJoin"
    value={formData.dateOfJoin}
    onChange={handleChange}
    required
    style={{ color: formData.dateOfJoin === "" ? "#9e9e9e" : "black" }}
    min={new Date().toISOString().split('T')[0]} 
  />
</div>

            <div className="employee-form-group">
              <label htmlFor="email">Email :</label>
    <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="Enter Email"
    />
</div>

            <div className="employee-form-group">
              <label htmlFor="contactNumber">Contact Number :</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="Enter Contact Number"
                maxLength="10" 
              />
            </div>

            <div className="employee-form-group">
              <label htmlFor="role">Role :</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{ color: formData.role === "" ? "#9e9e9e" : "black" }} 
              >
                <option value="" style={{ color: "#9e9e9e" }}>--- Select ---</option>
                <option value="Online Employee">Online Employee</option>
                <option value="Physical Employee">Physical Employee</option>
                <option value="Road Assistance">Road Assistance</option>
              </select>
            </div>
          </div>

          <div className="employee-form-actions">
            <button type="ebutton" onClick={handleClear}>Clear</button>
            <button type="esubmit">Submit</button>
          </div>

         
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} className={severity === 'success' ? 'Alert-success' : 'Alert-error'}>
          {message}
        </Alert>
      </Snackbar>
        </form>
      </div>
    </>
  );
};

export default EmployeeRegistration;
