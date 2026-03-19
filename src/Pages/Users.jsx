import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { collection, getDocs, deleteDoc, doc,getDoc, updateDoc,arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { MdEdit, MdDelete , MdAdd} from 'react-icons/md';
import { Search as SearchIcon } from '@mui/icons-material';
import Highlighter from 'react-highlight-words';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import ErrorIcon from '@mui/icons-material/Error'; 
import './Users.css';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';



function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [searchTerm, setSearchTerm] = useState('');
    const [noMatch, setNoMatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [vehicleDetails, setVehicleDetails] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [showVehicleModal, setShowVehicleModal] = useState(false); 
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [selectedNic, setSelectedNic] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
  

    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'userDetails');
                const userSnapshot = await getDocs(usersCollection);
    
                const userList = userSnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
    
                const userListWithSequence = userList.map((user, index) => ({
                    ...user,
                    sequenceno: index + 1, 
                }));
    
                const reversedUserList = [...userListWithSequence].reverse();
    
                setUsers(reversedUserList);
                setFilteredUsers(reversedUserList);
            } catch (error) {
                console.error('Error fetching users:', error);
                setMessage('Failed to fetch users. Please try again.');
                setSeverity('error');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsers();
    }, []);
    
    
    const handleAddVehicle = async () => {

        const vehicleNumberRegex = /^[A-Z]{2,3}-\d{4}$/;
        if (!vehicleNumber || !vehicleType || !vehicleModel || !vehicleBrand) {
            setSnackbarOpen(true);
            setSeverity('error');
            setMessage('Please fill all fields');
            return;
        }
    
        if (!vehicleNumberRegex.test(vehicleNumber)) {
            setSnackbarOpen(true);
            setSeverity('error');
            setMessage('Invalid vehicle number format. Example: CAS-5486 or MZ-3133');
            return;
        }
    
        const userRef = doc(db, 'userDetails', selectedNic);  
    
        try {
          
            const userDoc = await getDoc(userRef);
    
            if (userDoc.exists()) {
               
                const existingVehicles = userDoc.data().vehicles || [];
    
                const newVehicle = {
                    vehicleNumber,
                    type: vehicleType,    
                    model: vehicleModel,  
                    brand: vehicleBrand, 
                };
    
                existingVehicles.push(newVehicle);

                await updateDoc(userRef, {
                    vehicles: existingVehicles
                });
    
              
                setVehicleNumber('');
                setVehicleType('');
                setVehicleModel('');
                setVehicleBrand('');
    
                setSnackbarOpen(true);
                setSeverity('success');
                setMessage('Vehicle added successfully!');
                setShowModal(false);  
            } else {
                setSnackbarOpen(true);
                setSeverity('error');
                setMessage('User not found');
            }
        } catch (error) {
            console.error("Error adding vehicle: ", error);
            setSnackbarOpen(true);
            setSeverity('error');
            setMessage('Failed to add vehicle');
        }
    };
    
    
    
    const handleCloseModal = () => {
        setVehicleNumber('');
        setVehicleType('');
        setVehicleModel('');
        setVehicleBrand('');
        setShowModal(false); 
    };
    

    const openAddVehicleModal = (nic) => {
       
        setSelectedNic(nic);  
        setShowModal(true);  
    };

    const handleViewVehicles = async (nic) => {
        try {
            const userDocRef = doc(db, 'userDetails', nic); 
            const userDocSnap = await getDoc(userDocRef);
    
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setVehicleDetails(Array.isArray(userData?.vehicles) ? userData.vehicles : []); 
                setSelectedOwner(userData.nic || 'Unknown NIC'); 
                setShowVehicleModal(true); 
            } else {
                console.error('No such document!');
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
        }
    };

    
    const handleSearchChange = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        const filtered = users.filter(user =>
            user.nic && user.nic.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUsers(filtered);
        setNoMatch(filtered.length === 0 && value !== '');
    };

    const handleOpenDialog = (id) => {
        setDeleteId(id);
        setOpen(true);
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'userDetails', deleteId));
            setUsers(users.filter(user => user.nic !== deleteId));
            setFilteredUsers(filteredUsers.filter(user => user.nic !== deleteId));
            setMessage('User deleted successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage('Failed to delete user. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true);
            setOpen(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const handleCloseNoMatch = () => {
        setNoMatch(false);
        setSearchTerm(''); 
        setFilteredUsers(users); 
    }

    const columns = [
        { name: 'SequenceNo', selector: row => row.sequenceno, sortable: true, style: { width: '100px', textAlign: 'center' } },
        { name: 'First Name', selector: row => row.firstName, sortable: true, style: { width: '150px', textAlign: 'center' } },
        { name: 'Last Name', selector: row => row.lastName, sortable: true, style: { width: '150px', textAlign: 'center' } },
        {
            name: 'NIC',
            selector: row => row.nic,
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.nic}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: { width: '150px', textAlign: 'center' }
        },
        { name: 'Address', selector: row => row.address, sortable: true, style: { width: '150px', textAlign: 'center' } },
        { name: 'Email', selector: row => row.email, sortable: true, style: { width: '300px', textAlign: 'center' } },
        { name: 'Contact', selector: row => row.contact || row.contactNumber, sortable: true, style: { width: '150px', textAlign: 'center' } },
        {
            name: 'Registered Vehicles',
            cell: row => (
                <button 
                variant="contained"
                color="primary"
                onClick={() => handleViewVehicles(row.nic)}
                style={{ margin: 'auto', display: 'block', backgroundColor: '#52b1bf', fontSize: '14px', fontWeight: '500',padding: '5px 10px', cursor: 'pointer',color:'white',borderRadius:'4px'   }}>
                    Details
                </button>
            ),
            style: { width: '200px', textAlign: 'center' }
        },
        {
            name: 'Action',
            cell: row => (
                <div className="action-icon">
                     <MdAdd 
                className="iconuser add-iconuser" 
                onClick={() => openAddVehicleModal(row.nic)} 
            />
                    <MdEdit className="iconuser edit-icon" onClick={() => navigate(`/updateuser/${row.nic}`)} />
                    <MdDelete className="iconuser delete-icon" onClick={() => handleOpenDialog(row.nic)} />
                   
                </div>
            ),
            style: { width: '250px' }
        },
    ];


return (
        <>
            <div className="user-manage">
                {!loading && filteredUsers.length > 0 && (
                    <>
                        <div className="user-header">
                            <h2>Manage Users</h2>
                        </div>
                        <div className="search-bar-container">
                            <TextField
                                label="Search by NIC"
                                variant="outlined"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: '#b0b0b0' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    marginBottom: '20px',
                                    width: '100%',
                                    maxWidth: '420px',
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f8f8f8',
                                        borderRadius: '15px',
                                        '& fieldset': { borderColor: '#abadad' },
                                        '&:hover fieldset': { borderColor: '#aaa' },
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

            <div className="customer-view">
                <div className="data-table-containeruser">
                    {loading ? (
                        <Typography>Loading users...</Typography>
                    ) : filteredUsers.length === 0 && noMatch ? (
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
                                No matching user data found.
                            </Typography>
                            <CloseIcon
                                onClick={handleCloseNoMatch}
                                style={{ cursor: 'pointer', color: '#777', marginRight: '5px' }}
                            />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                            selectableRows
                            selectableRowsHighlight
                            pagination
                            fixedHeader
                            highlightOnHover
                            striped
                            responsive
                            fixedHeaderScrollHeight="1000vh"
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontSize: '14px',
                                        backgroundColor: '#f0fffe',
                                        color: '#041456',
                                        fontWeight: 'bold',
                                        width: '100px',
                                        borderRight: '1px solid #f3f3f3',
                                        padding: '10',
                                        borderBottom: '2px solid #f3f3f3',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        zIndex:'1000',
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

                           rows: {
            style: {
                '&:hover': {
                    backgroundColor: '#fafafa', 
                },
            },
        },
    }}
/>
                    )}
                </div>
            </div>

            {showModal && (
    <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        sx={{
            '& .MuiDialog-paper': {
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                width: 'min(90vw, 500px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                maxHeight: '80vh',
                overflowY: 'auto',
            }
        }}
    >
        <DialogTitle 
            sx={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                borderBottom: '2px solid #f1f1f1',
                paddingBottom: '15px',
                marginBottom: '10px',
            }}
        >
            Add  New Vehicle
        </DialogTitle>
        <DialogContent>
        <TextField
    label="Vehicle Number"
    value={vehicleNumber}
    onChange={(e) => {
        const value = e.target.value;
        setVehicleNumber(value);

      
        const vehicleNumberRegex = /^[A-Z]{2,3}-\d{4}$/;

        if (value !== '' && !vehicleNumberRegex.test(value)) {
            setError('Invalid vehicle number format. Example: CAS-5486 or MZ-3133');
            setOpenSnackbar(true);
        } else {
            setError('');
            setOpenSnackbar(false);
        }
    }}
    fullWidth
    sx={{
        marginBottom: '15px',
        '& .MuiInputBase-root': {
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            border: '1px solid #e0e0e0',
            padding: '10px',
            fontSize: '16px',
        },
        '& .MuiInputBase-root:focus': {
            borderColor: '#4caf50',
            boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
        },
    }}
/>



       <FormControl sx={{
                marginBottom: '15px',
               '& .MuiInputBase-root': {
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
                border: '1px solid #e0e0e0',
                padding: '10px',
                fontSize: '16px',
                width:'390px'

            },
            '& .MuiInputBase-root:focus': {
                borderColor: '#4caf50',
                boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
            }
        }}>
    <InputLabel>Vehicle Type</InputLabel>
    <Select
        label="Vehicle Type"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        
    >
        <MenuItem value="Car">Car</MenuItem>
        <MenuItem value="Van">Van</MenuItem>
        <MenuItem value="Bus">Bus</MenuItem>
        <MenuItem value="Lorry">Lorry</MenuItem>
       
    </Select>
</FormControl>
            <TextField
                label="Vehicle Model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                fullWidth
                sx={{
                    marginBottom: '15px',
                    '& .MuiInputBase-root': {
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        border: '1px solid #e0e0e0',
                        padding: '10px',
                        fontSize: '16px',
                    },
                    '& .MuiInputBase-root:focus': {
                        borderColor: '#4caf50',
                        boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
                    }
                }}
            />
            <TextField
                label="Vehicle Brand"
                value={vehicleBrand}
                onChange={(e) => setVehicleBrand(e.target.value)}
                fullWidth
                sx={{
                    marginBottom: '15px',
                    '& .MuiInputBase-root': {
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        border: '1px solid #e0e0e0',
                        padding: '10px',
                        fontSize: '16px',
                    },
                    '& .MuiInputBase-root:focus': {
                        borderColor: '#4caf50',
                        boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
                    }
                }}
            />
        </DialogContent>
        <DialogActions
            sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
            }}
        >
            <Button
                onClick={() => setShowModal(false)}
                color="primary"
                sx={{
                    width:'120px',
                    fontWeight: '600',
                    fontSize: '16px',
                    textTransform: 'none',
                    borderRadius: '5px',
                    padding: '8px 20px',
                    backgroundColor: '#c9350b',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#e53935',
                    }
                }}
            >
                Cancel
            </Button>
            <Button
                onClick={handleAddVehicle}
                color="primary"
                sx={{
                    width:'120px',
                    fontWeight: '600',
                    fontSize: '16px',
                    textTransform: 'none',
                    borderRadius: '5px',
                    padding: '8px 20px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#45a049',
                    }
                }}
            >
                Add 
            </Button>
        </DialogActions>
    </Dialog>
)}


            <Dialog  className="vehicle-details-dialog" open={showVehicleModal} onClose={() => setShowVehicleModal(false)} maxWidth="sm" fullWidth>
    <DialogTitle>
        <Typography variant="h6" style={{ fontWeight: 'bold', textAlign: 'center',color:'darkblue',marginBottom:'20px',margin:'10px'}}>
            Vehicles Registered to NIC: {selectedOwner}
        </Typography>
        

    </DialogTitle>
    <DialogContent>
        {vehicleDetails && vehicleDetails.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead> 
                    <tr style={{ borderBottom: '2px solid #ddd'}}>
                        <th style={{ padding: '8px', textAlign: 'left',color:'#072456' }}>Vehicle Number</th>
                        <th style={{ padding: '8px', textAlign: 'left',color:'#072456' }}>Brand</th>
                        <th style={{ padding: '8px', textAlign: 'left',color:'#072456' }}>Type</th>
                        <th style={{ padding: '8px', textAlign: 'left',color:'#072456' }}>Model</th>
                        <th style={{ padding: '8px', textAlign: 'left',color:'#072456' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicleDetails.map((vehicles, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px', color: '#000', fontWeight: 500 }}>{vehicles.vehicleNumber || 'N/A'}</td>
                            <td style={{ padding: '8px', color: '#000', fontWeight: 500 }}>{vehicles.brand || 'N/A'}</td>
                            <td style={{ padding: '8px', color: '#000', fontWeight: 500 }}>{vehicles.type || 'N/A'}</td>
                            <td style={{ padding: '8px', color: '#000', fontWeight: 500}}>{vehicles.model || 'N/A'}</td>
                            <td style={{ padding: '8px', textAlign: 'left' }}>
                            <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={async () => {
                                        try {
                                            const userDocRef = doc(db, 'userDetails', selectedOwner);
                                            await updateDoc(userDocRef, {
                                                vehicles: arrayRemove(vehicles),
                                            });
                                            setVehicleDetails(vehicleDetails.filter((v, i) => i !== index));
                                            setMessage('Vehicle removed successfully!');
                                            setSeverity('success');
                                            setSnackbarOpen(true);
                                        } catch (error) {
                                            console.error('Error removing vehicle:', error);
                                            setMessage('Failed to remove vehicle. Please try again.');
                                            setSeverity('error');
                                            setSnackbarOpen(true);
                                        }
                                    }}
                                >
                                    Remove
                                </Button>
              </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
        ) : (
            <Typography variant="body1" style={{ textAlign: 'center', marginTop: '10px' }}>
                No vehicles registered for this NIC.
            </Typography>
        )}


    </DialogContent>
    
    <DialogActions>
        <Button onClick={() => setShowVehicleModal(false)} variant="" style={{ margin: '0 auto', display: 'block',backgroundColor: '#f44336',color:'#ffffff',fontWeight:700,marginRight:'20px',marginBottom:'20px',marginTop:'10px' }}>
            Close
        </Button>
        
    </DialogActions>
</Dialog>


           
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    <Typography variant="h6" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Confirm Deletion
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this user? This action cannot be undone.
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
        </>
    );
}

export default Users;
