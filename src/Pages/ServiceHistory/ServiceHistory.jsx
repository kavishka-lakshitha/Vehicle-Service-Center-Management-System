import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { IoDocumentText } from 'react-icons/io5';
import Highlighter from 'react-highlight-words'; 
import { Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './ServiceHistory.css';
import { useNavigate } from 'react-router-dom'; 

function serviceHistory() {
    const [serviceHistory, setServiceHistory] = useState([]);
    const [filteredServiceHistory, setFilteredServiceHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true); 
    const [noMatch, setNoMatch] = useState(false);
    const navigate = useNavigate(); 
    
    useEffect(() => {
        const fetchServiceHistory = async () => {
            try {
                const usersCollection = collection(db, 'service_history');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    serviceId: index + 1,
                    ...doc.data(),
                }));
    
                
                const sortedServiceHistory = userList.sort((a, b) => 
                    new Date(b.completion_timestamp) - new Date(a.completion_timestamp)
                );
    
                setServiceHistory(sortedServiceHistory);
                setFilteredServiceHistory(sortedServiceHistory);
            } catch (error) {
                console.error('Error fetching serviceHistory:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServiceHistory();
    }, []);
    

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = serviceHistory.filter(serviceHistory =>
            serviceHistory.vehicle_number.toLowerCase().includes(term) ||
            serviceHistory.reservation_number.toLowerCase().includes(term)
        );
        setFilteredServiceHistory(filtered);
        setNoMatch(filtered.length === 0 && term !== ''); 
        
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false); 
        setSearchTerm(''); 
        setFilteredServiceHistory(serviceHistory); 
    };


const handleDetailsClick = (id) => {
    console.log('Navigating to details for ID:', id);
    navigate(`/serviceHistoryDetails/${id}`);
}
    
    const columns = [
        {
            name: 'Service_History Number',
            selector: row => row. serviceId,
            sortable: true,
            style: {
                width: '300px', 
                textAlign: 'center' 
            }
        },
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
                    textToHighlight={row.vehicle_number }
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: {
                width: '350px', 
                textAlign: 'center' 
            }
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            style: {
                width: '300px', 
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
                width: '250px', 
                textAlign: 'center' 
            }
        },
    ];

    return (
        <>
            <div className="serviceHistory_reservation">
                {!loading && filteredServiceHistory.length > 0 && (
                    <>
                         <div className="serviceHistory-header">
                            <h2>Service History</h2>
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

            <div className="serviceHistoryboard-container">
                <div className="serviceHistory-table-container">
                    {loading ? (
                        <Typography>Loading reservations...</Typography>
                    ) : filteredServiceHistory.length === 0 && noMatch ? (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            flexDirection: 'row', 
                            margin: '20px', 
                            borderRadius: '8px',    
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', 
                            marginTop:'20rem',
                            background: '#f9f9f9',
                            padding: '10px',     
                            height: '10vh' ,
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
                            data={filteredServiceHistory}
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
                                        position:'sticky'
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

export default serviceHistory;
