import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IoDocumentText,IoFilterSharp } from 'react-icons/io5';
import Highlighter from 'react-highlight-words'; 
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com'; 
import './Reservation.css';

function Reservation() {
    const [bookings, setReservation] = useState([]); 
    const [filteredReservations, setFilteredReservation] = useState(bookings); 
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success'); 
    const [noMatch, setNoMatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dateInput, setDateInput] = useState('');
    const [emailDialogOpen, setEmailDialogOpen] = useState(false); 
    const [selectedReservation, setSelectedReservation] = useState(null); 

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const usersCollection = collection(db, 'bookings');
                const userSnapshot = await getDocs(usersCollection);
                
                const userList = userSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.metadata.creationTime,
                }));
    
             
                const sortedReservations = userList.sort((a, b) => {
                    const numberA = parseInt(a.reservation_number.replace('res-', ''), 10);
                    const numberB = parseInt(b.reservation_number.replace('res-', ''), 10);
                    return numberB - numberA;
                });
    
                setReservation(sortedReservations);
                setFilteredReservation(sortedReservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, []);
    


    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered =bookings.filter(bookings=>
            bookings.vehicle_number.toLowerCase().includes(term) ||
            bookings.reservation_number.toLowerCase().includes(term)
        );
        setFilteredServiceHistory(filtered);
        setNoMatch(filtered.length === 0 && term !== ''); 
    };

    const handleFilterClick = () => {
        if (dateInput.trim() === '') {
            setFilteredReservation(bookings); 
            setNoData(false);
            return;

        }
    
        const filtered = bookings.filter(booking => booking.date === dateInput.trim());
        setFilteredReservation(filtered);

        if (filtered.length === 0) {
            setFilteredReservation([]); 
            setNoMatch(true); 
        } else {
            setFilteredReservation(filtered); 
            setNoMatch(false); 
        }
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false); 
        setSearchTerm(''); 
        setFilteredReservation(bookings); 
    };

    const handleOpenDialog = (id) => {
        setDeleteId(id);
        setOpen(true);
    };

    
      const handleDateInputChange = (event) => {
        setDateInput(event.target.value);
    };

    
    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'bookings', deleteId));
            const updatedReservations = bookings.filter(reservation => reservation.id !== deleteId);
            setReservation(updatedReservations);
            setFilteredReservation(updatedReservations);
            setMessage('Reservation deleted successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Error deleting reservation:', error);
            setMessage('Failed to delete reservation. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true);
            setOpen(false);
        }
    };


    const handleSend = async (reservation) => {
        const emailParams = {
            to_email: reservation.email,
            from_name: 'Ananda Auto Motor Techniques', 
            from_email: 'anandaautomoters@gmail.com', 
            reply_to: 'anandaautomoters@gmail.com', 
            vehicle_number: reservation.vehicle_number, 
            reservation_date: reservation.date, 
            reservation_time: reservation.time_slot, 
            reservation_number: reservation.reservation_number, 
            subject: 'Service Completed ',
            content: `Dear Customer,\n\nYour reservation for the vehicle ${reservation.reservation_number} with number ${reservation.vehicle_number} has been confirmed for ${reservation.date} at ${reservation.time_slot}.\n\nThank you for choosing our service!\n\nBest regards,\nAnanda Auto Motor Techniques`, // Email content
        };
        
        try {
            await emailjs.send('service_p5y9bzo', 'template_wysc1df', emailParams, 'G8dZDy5Vw9uH8bmhj');
    
            const bookingRef = doc(db, 'bookings', reservation.id);
            await updateDoc(bookingRef, {
                Completion_email_sent: true 
            });

            const emailCompletionDoc = {
                reservation_number: reservation.reservation_number,
                vehicle_number: reservation.vehicle_number,
                email: reservation.email,
                timestamp: new Date(), 
                Completion_email_sent: true 
            };

            await addDoc(collection(db, 'emailCompletion'), emailCompletionDoc);
    
   
            const serviceHistoryDoc = {
                reservation_number: reservation.reservation_number,
                vehicle_number: reservation.vehicle_number,
                date: reservation.date,
                time_slot: reservation.time_slot,
                email: reservation.email,
                nic:reservation.nic,
                contact_number: reservation.contact_number,
                vehicle_model: reservation.vehicle_model,
                vehicle_type: reservation.vehicle_type,
                vehicle_brand: reservation.vehicle_brand,
                services: reservation.services,
                Completion_email_sent: true,
                Confirmation_email_sent: reservation.Confirmation_email_sent || false, 
                Nextservice_email_sent: reservation.Nextservice_email_sent || false, 
                Reminder_email_sent: reservation.Reminder_email_sent || false, 
                completion_timestamp: new Date(), 
                next_service_date: new Date(new Date().setDate(new Date().getDate() + 1)) 
            };
    
           
            await addDoc(collection(db, 'service_history'), serviceHistoryDoc);
    
         
            await deleteDoc(bookingRef);
    
         
            const updatedReservations = bookings.filter(item => item.id !== reservation.id);
            setReservation(updatedReservations);
            setFilteredReservation(updatedReservations);
    
            setMessage('Reservation completion email sent and data saved to service history successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Failed to complete the process:', error);
            setMessage('Failed to complete the process. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true); 
        }
    };
    

    const handleDoneClick = async (reservation) => {
       
        const emailTemps = {
            to_email: reservation.email, 
            from_name: 'Ananda Auto Motor Techniques', 
            from_email: 'anandaautomoters@gmail.com', 
            reply_to: 'anandaautomoters@gmail.com', 
            vehicle_number: reservation.vehicle_number, 
            reservation_date: reservation.date,
            reservation_time: reservation.time_slot,
            reservation_number: reservation.reservation_number, 
            subject: 'Reservation Rejected Email', 
            ontent: `Dear Customer,\n\nYour reservation number ${reservation.reservation_number}  for the vehicle number ${reservation.vehicle_number} has been rejected.\n\nThank you for your understanding!\n\nBest regards,\nAnanda Auto Motor Techniques`, 

        };
    
        try {
            await emailjs.send('service_j4mfvhe', 'template_jk4g0sv', emailTemps, 'zbHvGrmdn3NzB5NGY');
    
            const bookingRef = doc(db, 'bookings', reservation.id);
            await updateDoc(bookingRef, {
                Completion_email_sent: true 
            });
    
            const emailRejectionDoc = {
                reservation_number: reservation.reservation_number,
                vehicle_number: reservation.vehicle_number,
                date: reservation.date,
                time_slot: reservation.time_slot,
                email: reservation.email,
                nic:reservation.nic,
                contact_number: reservation.contact_number,
                vehicle_model: reservation.vehicle_model,
                vehicle_type: reservation.vehicle_type,
                vehicle_brand: reservation.vehicle_brand,
                services: reservation.services,
                rejected_date:new Date(),
                Rejection_email_sent: true 
            };
    

            await addDoc(collection(db, 'emailRejection'), emailRejectionDoc);
        
    
            await deleteDoc(bookingRef);
    
            const updatedReservations = bookings.filter(item => item.id !== reservation.id);
            setReservation(updatedReservations);
            setFilteredReservation(updatedReservations);
    
            setMessage('Reservation rejected email sent and data saved to email rejection collection successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Failed to complete the process:', error);
            setMessage('Failed to complete the process. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true); 
        }
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const navigate = useNavigate();

    const handleDetailsClick = (reservationId) => {
        navigate(`/reservations/details/${reservationId}`);
    };

    const handleEdit = (id) => {
        navigate(`/UpdateReservation/${id}`);
    };

         const handleOpenEmailDialog = (reservation) => {
            setSelectedReservation(reservation);
            setEmailDialogOpen(true);
        };
    
        const handleConfirmSendEmail = () => {
            if (selectedReservation) {
                handleSend(selectedReservation);
            }
            setEmailDialogOpen(false);
        };

        const handleCancelSendEmail = () => {
            setEmailDialogOpen(false);
            setSelectedReservation(null); 
        };

    const columns = [

        {
            name: 'Reservation Number',
            selector: row => row.reservation_number,
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.reservation_number }
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: {
                width: '140px', 
                textAlign: 'center' 
            }
        },
        
        {
            name: 'Details',
            cell: row => (
                <div className="detail-icons" onClick={() => handleDetailsClick(row.id)}>
                    <IoDocumentText className={'icons doc-icons'} />
                </div>
            ),
            style: {
                width: '100px', 
                textAlign: 'center' 
            }
        },
        {
            name: 'Vehicle Number',
            selector: row => row.vehicle_number,
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.vehicle_number || ''}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: {
                width: '250px', 
                textAlign: 'center' 
            }
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            cell: row => (
                <Highlighter
                searchWords={[dateInput]} 
                autoEscape={true}
                textToHighlight={row.date || ''}
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: {
                width: '100px',
                textAlign: 'center',
            },
        },
        
        {
            name: 'Time',
            selector: row => row.time_slot,
            sortable: true,
            style: {
                width: '250px', 
                textAlign: 'center' 
            }
        },


        {
            name: 'Service Completion Mail',
            cell: row => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenEmailDialog(row)} 
                    style={{ margin: 'auto', display: 'block', backgroundColor: '#52b1bf', fontSize: '14px', fontWeight: '500'}}
                >
                    Send
                </Button>
            ),
            style: {
                width: '250px',
                textAlign: 'center'
            }
        },

        {
            name: 'Rejecting Booking',
            cell: row => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>handleDoneClick(row)}
                    style={{ margin: 'auto', display: 'block', backgroundColor: '#52b1bf', fontSize: '14px', fontWeight: '500' }}
                >
                    Reject
                </Button>
            ),
            style: {
                width: '200px',
                textAlign: 'center'
            }
        },

        {
            name: 'Action',
            cell: row => (
                <div className="action-icon">
                    <MdEdit className='iconuser edit-icon' onClick={() => handleEdit(row.id)} />
                    <MdDelete className='iconuser delete-icon' onClick={() => handleOpenDialog(row.id)} />
                </div>
            ),
            style: {
                width: '250px', 
            }
        }
    ];

    return (
        <>
            <div className="reservation">
            {!loading && filteredReservations.length > 0 && (
                <>
                        <div className="reservation-header">
                            <h2>Service Reservations</h2>
                        </div>

                      
                        <div className="search-bar-container">
                            <TextField
                                label="Search"
                                variant="outlined"
                                value={searchTerm}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: '#b0b0b0' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    marginBottom: '20px',
                                    width: '300px',
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f8f8f8',
                                        borderRadius: '15px',
                                        '& fieldset': { borderColor: '#abadad' },
                                        '&:hover fieldset': { borderColor: '#aaa' },
                                        padding: '2px 12px',
                                        minHeight: '36px',
                                    },
                                    '& .MuiOutlinedInput-input': { color: '#b0b0b0', padding: '8px 12px' },
                                    '& .MuiInputLabel-root': { color: '#b0b0b0', top: '-5px' },
                                }}
                            />
                        </div>

                    </>
                )}
            </div>

            {!loading && filteredReservations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>

             
                <IoFilterSharp
                    size={24}
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={handleFilterClick}
                />

                <TextField
                    label=""
                    variant="outlined"
                    type="date"
                    value={dateInput}
                    onChange={handleDateInputChange}
                    placeholder="yyyy-MM-dd"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f8f8f8',
                            borderRadius: '15px',
                            width:'250px',
                            height:'50px'
                        },
                        '& .MuiInputLabel-root': {
                            color: '#b0b0b0',
                        },
                    }}
                />
            </div>
            )}

        
            <div className="reservationboard-container">
                <div className="reservationdata-table-container">
                {loading ? (
                        <Typography>Loading reservations...</Typography>
                    ) : filteredReservations.length === 0 && noMatch ? (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            flexDirection: 'row', 
                            margin: '20px', 
                            borderRadius: '8px',    
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', 
                            marginTop:'12rem',
                            background: '#f9f9f9',
                            padding: '10px',     
                            height: '10vh' ,
                        }}>
                            <ErrorIcon style={{ color: '#d32f2f', marginRight: '10px' }} />  
                            <Typography variant="h6" style={{ color: '#333', marginRight: '20px', fontSize: '20px' }}> 
                                No matching reservation data found.
                            </Typography>
                            <CloseIcon
                                onClick={handleCloseNoMatch}
                                style={{ cursor: 'pointer', color: '#777', marginRight: '5px' }} 
                            />
                        </div>
                    ):(
                        <DataTable
                            columns={columns}
                            data={filteredReservations}
                            selectableRows
                            selectableRowsHighlight
                            pagination
                            fixedHeader
                            fixedHeaderScrollHeight="1000vh"
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontSize: '14px',
                                        backgroundColor: '#f0fffe',
                                        color: '#041456',
                                        fontWeight: 'bold',
                                        width:'100',
                                        borderRight: '1px solid #f3f3f3',
                                        padding: '10',
                                        borderBottom:'2px solid #f3f3f3',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                },
                                cells: {
                                    style: {
                                        minHeight: '56px',
                                        fontSize: '14px',
                                        padding: '10px',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                    },
                                },
                            }}
                        />
                    )}
                </div>
            </div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    <Typography variant="h6" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Confirm Deletion
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this reservation? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleDelete} variant="contained" style={{ backgroundColor: '#d32f2f', color: '#fff', marginRight: 50, width: 100, marginBottom: 30 }}>
                        Yes
                    </Button>
                    <Button onClick={() => setOpen(false)} variant="outlined" style={{ borderColor: '#b0bec5', color: '#000', marginRight: 60, width: 100, marginBottom: 30 }}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={severity} className={severity === 'success' ? 'Alert-success' : 'Alert-error'}>
                    {message}
                </Alert>
            </Snackbar>

            
            <Dialog open={emailDialogOpen} onClose={handleCancelSendEmail}>
                <DialogTitle>Confirm Email</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to send the service completion email?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmSendEmail} color="primary">
                        Yes
                    </Button>
                    <Button onClick={handleCancelSendEmail} color="secondary">
                        No
                    </Button>
                </DialogActions>
            </Dialog>

   
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
        </>
    );
}

export default Reservation;