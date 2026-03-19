import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './UpdateReservation.css';
import { IoChevronBackOutline } from "react-icons/io5";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const UpdateReservation = () => {
    const { id } = useParams();
    const [reservation, setReservation] = useState({}); 
    const [userDetails, setUserDetails] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [message, setMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservation = async () => {
            try {
               
                const reservationDoc = await getDoc(doc(db, 'bookings', id));
                
                if (reservationDoc.exists()) {
                    const reservationData = { id: reservationDoc.id, ...reservationDoc.data() };
                    setReservation(reservationData);
                    console.log('Reservation Data:', reservationData);
    
                  
                    await fetchUserDetails(reservationData.nic);
                } else {
                    console.log('No reservation found!');
                    setErrorMessage('No reservation found.');
                }
            } catch (error) {
                console.error('Error fetching reservation:', error);
                setErrorMessage('Failed to fetch reservation.');
            }
        };

        const fetchUserDetails = async (nic) => {
            try {
                console.log('Querying user details for NIC:', nic);
        
                
                const userQuery = query(
                    collection(db, 'userDetails'),
                    where('nic', '==', nic)  
                );
                const userQuerySnapshot = await getDocs(userQuery);
        
                
                if (!userQuerySnapshot.empty) {
                    const userDoc = userQuerySnapshot.docs[0];
                    console.log('User Data Found:', userDoc.data());
                    setUserDetails(userDoc.data());
        
                   
                    const selectedVehicle = userDoc.data().vehicles?.find(vehicle => vehicle.vehicleNumber === reservation.vehicle_number);
                    setReservationVehicle(selectedVehicle);  
                    
                    setErrorMessage('');
                } else {
                    console.log('No user found for NIC:', nic);
                    setUserDetails(null); 
                    setReservationVehicle(null); 
                    setErrorMessage('No user found for this NIC.'); 
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                
            }
        };
        

        fetchReservation(); 
    }, [id]); 
    
   
    if (reservation === null || userDetails === null) {
        return <div>Loading...</div>; 
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
    
        const contactNumber = reservation.contact_number;
    
        if (!/^0\d{9}$/.test(contactNumber)) {
            setSeverity('error');
            setMessage('Contact number must start with "0" and have exactly 10 digits.');
            setSnackbarOpen(true);
            return; 
        }
    
 
        try {
            await updateDoc(doc(db, 'bookings', id), reservation);
            setSeverity('success');
            setMessage('Reservation updated successfully!');
            setSnackbarOpen(true);
            navigate('/reservation');
        } catch (error) {
            console.error('Error updating reservation:', error);
            setSeverity('error');
            setMessage('Failed to update reservation.');
            setSnackbarOpen(true);
        }
    };
    

    const handleClear = () => {
       
        setReservation((prev) => ({
            ...prev,
            contact_number: '',
            date: '',
            time_slot: '',
            services: '',
        }));
    };

  
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
    const timeSlots = [
        '08:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 02:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM'
    ];
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <>
            <div className="header-updatedetails">
                <span className="details-text">Reservation Details :</span>
                <span className="vehicle-number">{reservation.vehicle_number}</span>
            </div>
            <div className="updatedetails-section">
                <form onSubmit={handleUpdate}>
                    <div className="form-groupUpdateDetails">
                        <label>Reservation Number:</label>
                        <input type="text" className="input-field1" value={reservation.reservation_number || ''} readOnly />
                    </div>

                    <div className="form-groupUpdateDetails">
                        <label>Name:</label>
                        <input type="text" className="input-field" value={userDetails?.firstName && userDetails?.lastName 
                            ? `${userDetails.firstName} ${userDetails.lastName}` : '-'} readOnly />
                    </div>

                    <div className="form-groupUpdateDetails">
                        <label>Email :</label>
                        <input type="email" className="input-field" value={userDetails?.email || ''} readOnly />
                    </div>

                    <div className="form-groupUpdateDetails">
                        <label>Address :</label>
                        <input type="text" className="input-field" value={userDetails?.address || ''} readOnly />
                    </div>
                    
                    <div className="form-groupUpdateDetails">
    <label>Contact Number:</label>
    <input
        type="tel"
        className="input-field2"
        value={reservation.contact_number || ''}
        onChange={(e) => {
            const value = e.target.value;
            
            if (/^\d{0,10}$/.test(value)) {
                setReservation({ ...reservation, contact_number: value });
            }
        }}
        onBlur={() => {
            const contactNumber = reservation.contact_number;
            
            if (!/^0\d{9}$/.test(contactNumber)) {
                setSeverity('error');
                setMessage('Contact number must start with "0" and have exactly 10 digits.');
                setSnackbarOpen(true);
            }
        }}
        maxLength={10}
        placeholder="Enter your contact number"
    />
</div>

   
                    <div className="form-groupUpdateDetails">
                        <label>Model :</label>
                        <input type="text" className="input-field" value={reservation.vehicle_model || ''} readOnly />
                    </div>
                    
                    <div className="form-groupUpdateDetails">
                        <label>Vehicle Type :</label>
                        <input type="text" className="input-field" value={reservation.vehicle_type || ''} readOnly />
                    </div>

                   
                    <div className="form-groupUpdateDetails">
                <label>Date:</label>
                <input
                    type="date"
                    className="input-field"
                    value={reservation.date || ''}
                    min={formatDate(new Date())} 
                    onChange={(e) => {
                        const selectedDate = new Date(e.target.value);
                        const day = selectedDate.getDay(); 

                        if (day === 0) {
                            setSeverity('error');
                            setMessage('You cannot select Sundays.');
                            setSnackbarOpen(true);
                            return;
                        }

                        setReservation({ ...reservation, date: e.target.value }); 
                    }}
                />
            </div>

                    <div className="form-groupUpdateDetails">
                        <label>Time :</label>
                        <select
                            className="input-field"
                            value={reservation.time_slot || ''}
                            onChange={(e) => setReservation({ ...reservation, time_slot: e.target.value })} 
                        >
                            <option value="">Select Time Slot</option>
                            {timeSlots.map((slot, index) => (
                                <option key={index} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-groupUpdateDetails">
    <label>Services :</label>
    <textarea
        className="input-field"
        value={
            reservation?.services
                ? Array.isArray(reservation.services)
                    ? reservation.services.join('\n') 
                    : reservation.services.replace(/,\s*/g, '\n') 
                : '' 
        }
        onChange={(e) => {
            const filteredValue = e.target.value
                .split('\n') 
                .map(line => line.replace(/[^a-zA-Z\s]/g, '')) 
                .join('\n'); 

            setReservation({
                ...reservation,
                services: filteredValue.split('\n'), 
            });
        }}
    />
</div>

                    <div className="form-groupUpdateDetails-actions">
                        <button type="submit" className="rubtn-update">Update</button>
                        <button type="button" className="rubtn-clear" onClick={handleClear}>Clear</button>
                        <button type="button" className="ruback-button" onClick={() => navigate('/reservation')}>
                            <IoChevronBackOutline /> Back
                        </button>
                    </div>
                    {errorMessage && <div className="Alert-error">{errorMessage}</div>} 
                    {successMessage && <div className="Alert-success">{successMessage}</div>} 
                </form>

                <Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
>
    <Alert
        onClose={handleCloseSnackbar}
        severity={severity} 
        className={severity === 'success' ? 'Alert-success' : 'Alert-error'}
    >
        {message} 
    </Alert>
</Snackbar>

            </div>
            
        </>
    );
};

export default UpdateReservation;
