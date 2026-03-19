import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Highlighter from 'react-highlight-words'; 
import { Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './Reject.css';

function Reject() {
    const [bookings, setReservation] = useState([]); 
    const [filteredReservations, setFilteredReservation] = useState(bookings); 
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true); 
    const [noMatch, setNoMatch] = useState(false);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                // Change the collection to 'emailRejection'
                const usersCollection = collection(db, 'emailRejection');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setReservation(userList);
                setFilteredReservation(userList);
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
        const filtered = bookings.filter(booking => // Change from serviceHistory to bookings
            booking.vehicle_number.toLowerCase().includes(term) ||
            booking.reservation_number.toLowerCase().includes(term)
        );
        setFilteredReservation(filtered);
        setNoMatch(filtered.length === 0 && term !== ''); 
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false); 
        setSearchTerm(''); 
        setFilteredReservation(bookings); 
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
                    textToHighlight={row.reservation_number}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: {
                width: '350px',
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
                width: '350px',
                textAlign: 'center'
            }
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            style: {
                width: '450px',
                textAlign: 'center'
            }
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            style: {
                width: '350px',
                textAlign: 'center'
            }
        },
    ];

    return (
        <>
            <div className="reservation">
                {!loading && filteredReservations.length > 0 && (
                    <>
                        <div className="reservation-header">
                            <h2>Rejected Reservations</h2>
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
                                        '& fieldset': {
                                            borderColor: '#abadad',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#aaa',
                                        },
                                        padding: '2px 12px',
                                        minHeight: '36px',
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
                            marginTop: '20rem',
                            background: '#f9f9f9',
                            padding: '10px',     
                            height: '10vh',
                        }}>
                            <ErrorIcon style={{ color: '#d32f2f', marginRight: '10px' }} />  
                            <Typography variant="h6" style={{ color: '#333', marginRight: '20px', fontSize: '20px' }}> 
                                No matching service history data found.
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
                            fixedHeaderScrollHeight="1000vh"
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontSize: '14px',
                                        backgroundColor: '#f0fffe',
                                        color: '#041456',
                                        fontWeight: 'bold',
                                        width: '100',
                                        borderRight: '1px solid #f3f3f3',
                                        padding: '10',
                                        borderBottom: '2px solid #f3f3f3',
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

export default Reject;
