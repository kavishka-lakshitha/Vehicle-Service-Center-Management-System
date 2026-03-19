import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';  // import your Firebase configuration here
import './servicesPage.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {Snackbar, Alert } from '@mui/material';


const ServicesPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [categoryName, setCategoryName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

 // Handle snackbar close action
 const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Fetch existing categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  // Function to generate category ID (C-0001, C-0002, ...)
  const generateCategoryId = async () => {
    const q = query(collection(db, 'categories'), orderBy('id', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const lastCategoryId = snapshot.docs.length > 0 ? snapshot.docs[0].data().id : 'C-0000';
    const newCategoryId = 'C-' + String(parseInt(lastCategoryId.split('-')[1]) + 1).padStart(4, '0');
    return newCategoryId;
  };

  // Function to add a new category
  const addCategory = async () => {
    if (categoryName.trim() === '') {
        setSnackbarMessage('Category name cannot be empty!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }
    try {
    const newCategoryId = await generateCategoryId();
    await addDoc(collection(db, 'categories'), { id: newCategoryId, categoryName });

   // Update the categories state to include the new category
   setCategories([...categories, { id: newCategoryId, categoryName: categoryName }]);
   setCategoryName('');
   setSnackbarMessage('Category added successfully!');
   setSnackbarSeverity('success');
   setSnackbarOpen(true);
} catch (error) {
   setSnackbarMessage('Error adding category: ' + error.message);
   setSnackbarSeverity('error');
   setSnackbarOpen(true);
 }
};


  // Function to generate service ID (S0001, S0002, ...)
  const generateServiceId = async () => {
    const q = query(collection(db, 'services'), orderBy('id', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const lastServiceId = snapshot.docs.length > 0 ? snapshot.docs[0].data().id : 'S0000';
    const newServiceId = 'S' + String(parseInt(lastServiceId.substring(1)) + 1).padStart(4, '0');
    return newServiceId;
  };

  // Function to add a new service
  const addService = async () => {
    if (selectedCategory === '' || serviceName.trim() === '' || price.trim() === '') {
        setSnackbarMessage('Please fill all fields!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }
    try {
    const newServiceId = await generateServiceId();
    await addDoc(collection(db, 'services'), {
      id: newServiceId,
      categoryID: selectedCategory,
      serviceName,
      price: parseFloat(price),
    });
      setServiceName('');
      setPrice('');
      setSelectedCategory('');
      setSnackbarMessage('Service added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
   } catch (error) {
      setSnackbarMessage('Error adding service: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
   }
};
 
  return (
  <>
  <div className='service'>
    <div className="service-manage">
        <div className="service-header">
            <h2>Manage Services</h2>
        </div>
    </div>
   
    <button className="viewButton" onClick={() => navigate('/categories')}> {/* Updated */}
         View the categories and services
      </button>
    
    
    <div className="servicecontainer">
      <div className="servicecard1">
        <div className='header1'>
        <h2>Add New Category</h2>
        </div>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          className="inputField"
        />
        <div className="buttonContainer">
          <button onClick={addCategory} className="button addButton1">Add</button>
          <button onClick={() => setCategoryName('')} className="button clearButton1">Clear</button>
        </div>
      </div>

      <div className="servicecard">
      <div className='header2'>
        <h2>Add New Service</h2>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="inputField"
        >
          <option value="" disabled>Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
          ))}
        </select>
        <input
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Service Name"
          className="inputField"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Rs.xxxx"
          className="inputField"
        />
        <div className="buttonContainer">
          <button onClick={addService} className="button addButton">Add</button>
          <button onClick={() => { setServiceName(''); setPrice(''); setSelectedCategory(''); }} className="button clearButton">Clear</button>
        </div>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
        </Snackbar>
      </div>
    </div>
    </div>
    </>
  );
};

export default ServicesPage;
