import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { MenuItem, Select, Typography, TextField, InputAdornment, Menu, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import Highlighter from 'react-highlight-words';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore'; // Import Firestore functions
import './Email.css';
import emailjs from 'emailjs-com'; // Import EmailJS
import MoreVertIcon from '@mui/icons-material/MoreVert';

function Email() {
    const [reservations, setReservations] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [noMatch, setNoMatch] = useState(false);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookingsQuery = query(collection(db, 'bookings'));
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setReservations(bookingsData);
                setFilteredReservations(bookingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [db]);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = reservations.filter(reservation =>
            reservation.vehicle_number.toLowerCase().includes(term) ||
            reservation.reservation_number.toLowerCase().includes(term)
        );
        setFilteredReservations(filtered);
        setNoMatch(filtered.length === 0 && term !== '');
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false);
        setSearchTerm('');
        setFilteredReservations(reservations);
    };

    const handleSendEmailBooking= async (reservation) => {
        // Prepare email parameters with reservation details, sender information, subject, and content
        const emailParams = {
            to_email: reservation.email, // Recipient's email address from the reservation
            reply_to: 'anandaautomoters@gmail.com', // Sender's reply email
            vehicle_number: reservation.vehicle_number, // Vehicle number from reservation
            reservation_date: reservation.date.toDate().toISOString().split('T')[0], // Convert Firestore Timestamp to date string if necessary
            reservation_time: reservation.time_slot, // Reservation time slot
            reservation_number: reservation.reservation_number, // Reservation number
            subject: 'Booking confirmation mail from Ananda Auto Motor Techniques', // Email subject
            content: `Dear Customer,\n\nYour booking has been successfully made for the Vehicle Number: ${reservation.vehicle_number}\n\nBooking Details:\n\nReservation Number: ${reservation.reservation_number}\n\nDate: ${reservation.date.toDate().toISOString().split('T')[0]}\n\nTime slot: ${reservation.time_slot}.\n\nServices: ${reservation.services}.\n\nThank you for choosing our service!\n\nBest regards,\nAnanda Auto Motor Techniques`, // Email content
        };
    
        try {
            // Send email via EmailJS
            await emailjs.send('service_j4mfvhe', 'template_zyfphs7', emailParams, 'zbHvGrmdn3NzB5NGY');
    
            // Check if reservation exists in 'bookings' collection
            const bookingRef = doc(db, 'bookings', reservation.id);
            const bookingDoc = await getDoc(bookingRef);
    
            if (bookingDoc.exists()) {
                // If reservation exists in 'bookings', update it
                await updateDoc(bookingRef, {
                    Confirmation_email_sent: true,
                });
            } else {
                // If not in 'bookings', check 'service_history' collection
                const serviceHistoryRef = doc(db, 'service_history', reservation.id);
                const serviceHistoryDoc = await getDoc(serviceHistoryRef);
    
                if (serviceHistoryDoc.exists()) {
                    // If reservation exists in 'service_history', update it
                    await updateDoc(serviceHistoryRef, {
                        Confirmation_email_sent: true,
                    });
                } else {
                    // Handle the case where reservation is not found in both collections
                    console.error('Reservation not found in either bookings or service history.');
                    setMessage('Reservation not found.');
                    setSeverity('error');
                    return;
                }
            }
    
            // Provide success feedback
            setMessage('Reservation booking confirmation email sent successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Failed to send the booking confirmation email:', error);
            setMessage('Failed to send the booking confirmation email. Please try again.');
            setSeverity('error');
        } finally {
            // Show the feedback in Snackbar
            setSnackbarOpen(true);
        }
    };

    const columns = [
        { 
            name: 'Reservation No', 
            selector: row => row.reservation_number, 
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.reservation_number}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: { width: '50px', textAlign: 'center' }
        },
        {
            name: 'Vehicle No', selector: row => row.vehicle_number, sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.vehicle_number}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: { width: '50px', textAlign: 'center' }
        },
        {
            name: 'Date',
            selector: row => {
                if (row.date.toDate) {
                    return row.date.toDate().toISOString().split('T')[0];
                } else if (typeof row.date === 'string') {
                    return new Date(row.date).toISOString().split('T')[0];
                }
                return row.date;
            },
            sortable: true,
            style: { width: '50px', textAlign: 'center' }
        },
        { name: 'Email', selector: row => row.email, sortable: true, style: { width: '100px', textAlign: 'center' } },
        { name: 'Booking Confirmation', selector: row => row.Confirmation_email_sent ? 'Yes' : 'No', sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Pre-Reminder', selector: row => row.Reminder_email_sent ? 'Yes' : 'No', sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Service Completion', selector: row => row.Completion_email_sent ? 'Yes' : 'No', sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Next Service Reminder', selector: row => row.Nextservice_email_sent ? 'Yes' : 'No', sortable: true, style: { width: '90px', textAlign: 'center' } },
        {
            name: 'Action',
            cell: (row) => {
                const [anchorEl, setAnchorEl] = useState(null);  // For handling the dropdown menu
                const open = Boolean(anchorEl);

                const handleClick = (event) => {
                    setAnchorEl(event.currentTarget);
                };

                const handleClose = () => {
                    setAnchorEl(null);
                };

                return (
                    <div className="action-container">
                        {/* Icon button that opens the dropdown */}
                        <IconButton onClick={handleClick}>
                            <MoreVertIcon />
                        </IconButton>

                        {/* Dropdown menu for the actions */}
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem>
                                <Button 
                                    onClick={() => {
                                        handleSendEmailBooking(row, 'Booking Confirmation');
                                        handleClose();
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Booking Confirmation
                                </Button>
                            </MenuItem>
                            <MenuItem>
                                <Button 
                                    onClick={() => {
                                        handleSendEmailPre(row, 'Pre-Reminder');
                                        handleClose();
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                     Pre-Reminder
                                </Button>
                            </MenuItem>
                            <MenuItem>
                                <Button 
                                    onClick={() => {
                                        handleSendEmailService(row, 'Service Completion');
                                        handleClose();
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Service Completion
                                </Button>
                            </MenuItem>
                            <MenuItem>
                                <Button 
                                    onClick={() => {
                                        handleSendEmailNext(row, 'Next Service Reminder');
                                        handleClose();
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Next Service Reminder
                                </Button>
                            </MenuItem>
                        </Menu>
                    </div>
                );
            },
            ignoreRowClick: true,
            style: { width: '750px', textAlign: 'center' }
        }
    ];

    return (
        <>
            <div className="email">
                {!loading && filteredReservations.length > 0 && (
                    <>
                        <div className="email-header">
                            <h2>Emails</h2>
                        </div>

                        <div className="emailsearch-bar-container">
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
                                    marginRight: '40px', 
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f8f8f8',
                                        borderRadius: '15px',
                                        '& fieldset': {
                                            borderColor: '#abadad',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#aaa',
                                        },
                                        padding: '2px 12px',
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: '#b0b0b0',
                                        padding: '8px 12px',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#b0b0b0',
                                        top: '-5px',
                                    },
                                }}
                            />
                        </div>
                    </>
                )}
            </div>  

            <div className="email-container">
                <div className="email-table-container">
                    {loading ? (
                        <Typography>Loading emails...</Typography>
                    ) : filteredReservations.length === 0 && noMatch ? (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            flexDirection: 'row', 
                            margin: '20px', 
                            borderRadius: '8px',    
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', 
                            marginTop:'20rem',
                            background: '#f9f9f9',  // Light gray background
                            padding: '10px',     
                            height: '10vh' ,         // Corrected to '10vh' for height
                            
                        }}>
                            <ErrorIcon style={{ color: '#d32f2f', marginRight: '10px' }} />  
                            <Typography variant="h6" style={{ color: '#333', marginRight: '20px', fontSize: '20px' }}> 
                                No matching email data found.
                            </Typography>
                            <CloseIcon
                                onClick={handleCloseNoMatch}
                                style={{ cursor: 'pointer', color: '#777', marginRight: '5px' }}  // Medium gray for close icon
                            />
                        </div>
                    ) : (
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
                    
        </>
    );
}

export default Email;
