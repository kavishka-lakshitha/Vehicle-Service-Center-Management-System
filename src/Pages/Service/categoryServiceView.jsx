import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { MdEdit, MdDelete } from 'react-icons/md';
import { db } from '../../firebase';  // import your Firebase configuration here
import './categoryServiceView.css';
import { Search as SearchIcon } from '@mui/icons-material';
import Highlighter from 'react-highlight-words';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import ErrorIcon from '@mui/icons-material/Error'; 
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'; // Add these imports



function CategoryServiceView() {
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [searchTerm, setSearchTerm] = useState('');
    const [noMatch, setNoMatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(''); // New state for selected category
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(categoriesList);

                const servicesSnapshot = await getDocs(collection(db, 'services'));
                const servicesList = servicesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setServices(servicesList);
                setFilteredServices(servicesList);
            } catch (error) {
                console.error('Error fetching data:', error);
                setMessage('Failed to fetch data. Please try again.');
                setSeverity('error');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchChange = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        const filtered = services.filter(service =>
            service.serviceName.toLowerCase().includes(value.toLowerCase()) &&
            (selectedCategory === '' || service.categoryID === selectedCategory)
        );

        setFilteredServices(filtered);
        setNoMatch(filtered.length === 0 && value !== '');
    };

    const handleCategoryChange = (event) => {
        const categoryID = event.target.value;
        setSelectedCategory(categoryID);

        // Filter the services based on the selected category and search term
        const filtered = services.filter(service =>
            (categoryID === '' || service.categoryID === categoryID) &&
            service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(filtered);
        setNoMatch(filtered.length === 0);
    };

    const handleOpenDialog = (id) => {
        setDeleteId(id);
        setOpen(true);
    };


    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'services', deleteId));
            setServices(services.filter(service => service.id !== deleteId));
            setFilteredServices(filteredServices.filter(service => service.id !== deleteId));
            setMessage('Service deleted successfully!');
            setSeverity('success');
        } catch (error) {
            console.error('Error deleting service:', error);
            setMessage('Failed to delete service. Please try again.');
            setSeverity('error');
        } finally {
            setSnackbarOpen(true);
            setOpen(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const handleCloseNoMatch = () => {
        setNoMatch(false);
        setSearchTerm(''); // Clear the search term
        setFilteredServices(services);

    }

    const columns = [
        { name: 'Category ID', selector: row => categories.find(category => category.id === row.categoryID)?.id|| 'N/A', sortable: true, style: { textAlign: 'center', width: '180px' } },
        { name: 'Category', selector: row => categories.find(category => category.id === row.categoryID)?.categoryName || 'N/A', sortable: true, style: { textAlign: 'center', width: '400px' } },
        { name: 'Service ID', selector: row =>row.id, sortable: true, style: { textAlign: 'center', width: '180px' } },
        
        {
            name: 'Service Name',
            selector: row => row.serviceName,
            sortable: true,
            cell: row => (
                <Highlighter
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={row.serviceName}
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                />
            ),
            style: { width: '500px', textAlign: 'center' }
        },
        { name: 'Price', selector: row => `$${row.price.toFixed(2)}`, sortable: true, style: { textAlign: 'center', width: '150px' } },

        {
            name: 'Action',
            cell: row => (
                <div className="action-iconsuser">
                    <MdEdit className="iconuser edit-iconuser" onClick={() => navigate(`/updateSCV/${row.id}`)} />
                    <MdDelete className="iconuser delete-iconuser" onClick={() => handleOpenDialog(row.id)} />
                </div>
            ),
            style: { width: '150px' }
        },
    ];


    return (
        <>
            <div className="user-manage">
            {!loading && filteredServices.length > 0 && (

                    <>
                        <div className="user-header">
                        <h2>Categories And Services</h2>
                        </div>
                        
                        <div className="search-bar-container">
                            <TextField
                                 label="Search by Service Name"
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
                                    width: '300px',
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

           
                            {/* Conditionally render the category filter only if there are services */}
                        {filteredServices.length > 0 && (
                            <div className="filters-container">
                                <FormControl variant="outlined" sx={{ minWidth: 500, marginLeft: '3rem', marginBottom: '20px', marginTop: '20px' }}>
                                    <InputLabel>Filter by Category</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        label="Filter by Category"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '15px',
                                                backgroundColor: '#f8f8f8',
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>All Categories</em>
                                        </MenuItem>
                                        {categories.map(category => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.categoryName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )}
                    
            <div className="customer-view">
                <div className="data-table-containeruser">
                    {loading ? (
                        <Typography>Loading data...</Typography>
                    ) : filteredServices.length === 0 && noMatch ? (
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
                                No matching service data found.
                            </Typography>
                            <CloseIcon
                                onClick={handleCloseNoMatch}
                                style={{ cursor: 'pointer', color: '#777', marginRight: '5px' }}
                            />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredServices}
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
                    backgroundColor: '#fafafa', // Set hover color
                },
            },
        },
    }}
/>
 )}
               
 </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    <Typography variant="h6" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Confirm Deletion
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this service? This action cannot be undone.
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
                <Alert onClose={handleCloseSnackbar} severity={severity} className={severity === 'success' ? 'userAlert-success' : 'userAlert-error'}>
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default CategoryServiceView;
