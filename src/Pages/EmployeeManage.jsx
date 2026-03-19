import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { MdEdit, MdDelete } from 'react-icons/md';
import Highlighter from 'react-highlight-words';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close'; 
import ErrorIcon from '@mui/icons-material/Error'; 
import { useNavigate } from 'react-router-dom';
import './EmployeeManage.css';

function EmployeeManage() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [noMatch, setNoMatch] = useState(false); 
    const navigate = useNavigate();

 
const fetchEmployees = async () => {
    try {
        
        const querySnapshot = await getDocs(collection(db, 'employees'));

        
        const employees = querySnapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            
            .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

        
        setEmployees(employees);
        setFilteredEmployees(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        setMessage('Failed to fetch employees.');
        setSeverity('error');
        setSnackbarOpen(true);
    } finally {
        setLoading(false);
    }
};


    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenDialog = (id) => {
        setDeleteId(id);
        setOpen(true);
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'employees', deleteId));
            const updatedEmployees = employees.filter(employee => employee.id !== deleteId);
            setEmployees(updatedEmployees);
            setFilteredEmployees(updatedEmployees);
            setMessage('Employee deleted successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Error deleting employee:', error);
            setMessage('Failed to delete employee. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true);
            setOpen(false);
        }
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = employees.filter(employee =>
            employee.nic.toLowerCase().includes(term)
        );
        setFilteredEmployees(filtered);
        setNoMatch(filtered.length === 0 && term !== ''); 
    };

    const handleEdit = (id) => {
        navigate(`/update/${id}`);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleCloseNoMatch = () => {
        setNoMatch(false); 
        setSearchTerm(''); 
        setFilteredEmployees(employees); 
    };

    const columns = [
        { name: 'Employee ID', selector: row => row.employeeId, sortable: true, width: '100px' },
        { name: 'First Name', selector: row => row.firstName, sortable: true, width: '160px' },
        { name: 'Last Name', selector: row => row.lastName, sortable: true, width: '160px' },
        { name: 'Address', selector: row => row.address, sortable: true, width: '200px' },
        { name: 'Email', selector: row => row.email, sortable: true, width: '200px' },
        {
            name: 'NIC',
            selector: row => row.nic,
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.nic || ''}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            width: '150px'
        },
        { name: 'Contact Number', selector: row => row.contactNumber, sortable: true, width: '150px' },
        { name: 'Date of Join', selector: row => row.dateOfJoin, sortable: true, width: '150px' },
        { name: 'Role', selector: row => row.role, sortable: true, width: '150px' },
        {
            name: 'Action',
            cell: row => (
                <div className="action-icon">
                    <MdEdit className='iconuser edit-icon' onClick={() => handleEdit(row.id)} />
                    <MdDelete className='iconuser delete-icon' onClick={() => handleOpenDialog(row.id)} />
                </div>
            ),
            width: '150px'
        }
    ];

    return (
        <>
            <div className="employee-manage">
                {!loading && filteredEmployees.length > 0 && (
                    <>
                        <div className="employeemanage-header">
                            <h2>Manage Employees</h2>
                        </div>
                        <div className="search-bar-container">
                            <TextField
                                label="Search by NIC"
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
                                    width: { xs: '100%', sm: '320px' },
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
    
            <div className='employeeboard-container'>
                <div className='employeedata-table-container'>
                    {loading ? (
                        <Typography>Loading employees...</Typography>
                    ) : filteredEmployees.length === 0 && noMatch ? (
                        <div className="no-results">
                            <ErrorIcon className="no-results-icon" />
                            <Typography variant="h6" className="no-results-message">
                                No matching employee data found.
                            </Typography>
                            <CloseIcon
                                className="no-results-close"
                                onClick={handleCloseNoMatch}
                            />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredEmployees}
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
                                    minHeight: '56px',
                                    fontSize: '14px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    justifyContent: 'center',
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
                        Are you sure you want to delete this employee? This action cannot be undone.
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

export default EmployeeManage;
