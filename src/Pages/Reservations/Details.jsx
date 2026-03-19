import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as necessary
import './Details.css';
import { IoChevronBackOutline } from "react-icons/io5";

const Details = () => {
    const { id } = useParams(); // Get the reservation ID from the URL
    const [reservation, setReservation] = useState(null); // Initialize as null
    const [userDetails, setUserDetails] = useState(null); // New state for user details
    const [errorMessage, setErrorMessage] = useState(''); // To display errors
    const [reservationVehicle, setReservationVehicle] = useState(null); // Store specific vehicle details
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                // Fetch reservation data using the reservation ID
                const reservationDoc = await getDoc(doc(db, 'bookings', id));
                
                if (reservationDoc.exists()) {
                    const reservationData = { id: reservationDoc.id, ...reservationDoc.data() };
                    setReservation(reservationData);
                    console.log('Reservation Data:', reservationData);
    
                    // Fetch user details using the NIC from the reservation data
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
                } else {
                    console.log('No user found for NIC:', nic);
                    setUserDetails(null); 
                    setReservationVehicle(null); 
                    setErrorMessage('No user found for this NIC.');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                setErrorMessage('Failed to fetch user details.');
            }
        };

        fetchReservation(); 
    }, [id]); 
    
    
    if (reservation === null || userDetails === null) {
        return <div>Loading...</div>; 
    }

    return (
        <>
            <div className="header-details">
                <span className="details-text">Reservation Details:</span>
                <span className="vehicle-number">{reservation.vehicle_number}</span>
            </div>
            <div className="details-section">
                <form>
               <div className="form-group">
                        <label>Reservation Number:</label>
                        <div className="input-field-no">{reservation.reservation_number || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <div className="input-fieldx"> {userDetails?.firstName && userDetails?.lastName 
                                 ? `${userDetails.firstName} ${userDetails.lastName}`: '-'}
                         </div>
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <div className="input-fieldx">{userDetails?.email || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>NIC:</label>
                        <div className="input-fieldx">{userDetails?.nic || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Address:</label>
                        <div className="input-fieldx">{userDetails?.address || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Contact Number:</label>
                        <div className="input-field-tel">{reservation.contact_number || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Model:</label>
                        <div className="input-fieldx">{reservation.vehicle_model || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Vehicle Type:</label>
                        <div className="input-fieldx">{reservation.vehicle_type || '-'}</div>
                    </div>
                    <div className="form-group">
                            <label>Brand:</label>
                            <div className="input-fieldx">{reservation.vehicle_brand || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Date:</label>
                        <div className="input-fieldx">{reservation.date || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Time:</label>
                        <div className="input-fieldx">{reservation.time_slot || '-'}</div>
                    </div>
                    <div className="form-group">
                        <label>Services:</label>
                        <div className="input-fieldx">{reservation?.services 
              ? (Array.isArray(reservation.services) 
                  ? reservation.services.map((service, index) => (
                      <p key={index} className="service-item">{service}</p>
                    ))
                  : reservation.services.split(',').map((service, index) => (
                      <p key={index} className="service-item">{service.trim()}</p>
                    ))
                )
              : '-'}</div>
                    </div>


                    <div className="form-actions">
                        <button type="button" className="back-button" onClick={() => navigate('/reservation')}>
                            <IoChevronBackOutline /> Back
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Details;


