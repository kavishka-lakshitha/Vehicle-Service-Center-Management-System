import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { MenuItem, Select, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { IoSend } from "react-icons/io5";
import Highlighter from 'react-highlight-words';
import './Sms.css';

function Sms() {
    const [reservations, setReservations] = useState([]);
    const [selectedAction, setSelectedAction] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [noMatch, setNoMatch] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = [
                    { reservationNo: '001', vehicleNo: 'ABC-1234', contact_number: '0723658945', bookingConfirmation: 'Sent', preReminder: 'Sent', serviceCompletion: 'Not Sent', nextServiceReminder: 'Not Sent' },
                    { reservationNo: '002', vehicleNo: 'XYZ-5678',contact_number: '0123486579', bookingConfirmation: 'Not Sent', preReminder: 'Sent', serviceCompletion: 'Sent', nextServiceReminder: 'Not Sent' }
                ];
                setReservations(data);
                setFilteredReservations(data); // Initialize filtered reservations
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleActionChange = (reservationNo, action) => {
        setSelectedAction(prevState => ({
            ...prevState,
            [reservationNo]: action
        }));
    };

    const handleSendSms = async (reservation) => {
        const action = selectedAction[reservation.reservationNo];
        if (action) {
            try {
                // Make sure sendEmail is defined and works
                await sendSms(reservation.email, action);
                alert(`SMS sent successfully to ${reservation.contact_number} for ${action}`);
            } catch (error) {
                console.error('Failed to send SMS:', error);
            }
        } else {
            alert('Please select an action before sending an SMS.');
        }
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = reservations.filter(reservation =>
            reservation.vehicleNo.toLowerCase().includes(term)
        );
        setFilteredReservations(filtered);
        setNoMatch(filtered.length === 0 && term !== '');
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false);
        setSearchTerm('');
        setFilteredReservations(reservations);
    };

    const columns = [
        { name: 'Reservation No', selector: row => row.reservationNo, sortable: true, style: { width: '90px', textAlign: 'center' } },
        {
            name: 'Vehicle No', selector: row => row.vehicleNo, sortable: true, style: { width: '90px', textAlign: 'center' },
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.vehicleNo || ''}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
        },
        { name: 'Contact Number', selector: row => row.contact_number, sortable: true, style: { width: '180px', textAlign: 'center' } },
        { name: 'Booking Confirmation', selector: row => row.bookingConfirmation, sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Pre-Reminder', selector: row => row.preReminder, sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Service Completion', selector: row => row.serviceCompletion, sortable: true, style: { width: '90px', textAlign: 'center' } },
        { name: 'Next Service Reminder', selector: row => row.nextServiceReminder, sortable: true, style: { width: '90px', textAlign: 'center' } },
        {
            name: 'Action',
            cell: (row) => (
                <div className="action-containerSms">
                    <Select
                        value={selectedAction[row.reservationNo] || ''}
                        onChange={(e) => handleActionChange(row.reservationNo, e.target.value)}
                        displayEmpty
                        className="select-alterSms"
                        sx={{ width: '100px', marginRight: '10px' }}
                    >
                        <MenuItem value="" disabled>...Select...</MenuItem>
                        <MenuItem value="Booking Confirmation">Booking Confirmation</MenuItem>
                        <MenuItem value="Pre-Reminder">Pre Reminder</MenuItem>
                        <MenuItem value="Service Completion">Service Completion</MenuItem>
                        <MenuItem value="Next Service Reminder">Next Service Reminder</MenuItem>
                    </Select>
                    <div className="action-resend">
                        <IoSend className='sendsms resend-sendsms' onClick={() => handleSendSms(row)} />
                    </div>
                </div>
            ),
            style: { width: '800px', textAlign: 'center' }
        }
    ];

    return (
        <>
        <div className="sms">
        {!loading && filteredReservations.length> 0 && (
                    <>
            <div className="sms-header">
                <h2>SMS</h2>
            </div>

            <div className="search-bar-container">
                <TextField
                    label="Search by Vehicle Number"
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

            <div className="sms-container">
                <div className="sms-table-container">
                    {loading ? (
                        <Typography>Loading SMS...</Typography>
                    ) : filteredReservations.length === 0 && noMatch ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            margin: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            marginTop: '20rem',
                            background: '#f9f9f9',
                            padding: '10px',
                            height: '10vh',
                        }}>
                            <ErrorIcon style={{ color: '#d32f2f', marginRight: '10px' }} />
                            <Typography variant="h6" style={{ color: '#333', marginRight: '20px', fontSize: '20px' }}>
                                No matching SMS data found.
                            </Typography>
                            <CloseIcon
                                onClick={handleCloseNoMatch}
                                style={{ cursor: 'pointer', color: '#777', marginRight: '5px' }}
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
                            fixedHeaderScrollHeight="100vh"
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontSize: '14px',
                                        backgroundColor: '#D5D5D5',
                                        color: '#041456',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                },
                                cells: {
                                    style: { minHeight: '56px' },
                                },
                            }}
                        />
                    )}
                </div>
            </div>
            </>
    );
}
export default Sms;
