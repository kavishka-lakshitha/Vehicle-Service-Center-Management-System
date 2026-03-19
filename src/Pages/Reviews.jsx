import React, { useEffect, useState } from 'react';
import {Box,Typography, Avatar,Card,CardContent,CardHeader,Button, Dialog,DialogActions, DialogContent, DialogContentText,DialogTitle,TextField,IconButton, Snackbar,} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebase';
import Star from '@mui/icons-material/Star'; // Import star icon
import StarBorder from '@mui/icons-material/StarBorder'; // Import empty star icon
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import { Alert } from '@mui/material'; 
import './Reviews.css'; 

const Reviews = () => {
  const [reviews, setReviews] = useState([]); // Store reviews fetched from Firestore
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [error, setError] = useState(null); // Store error message if any
  const [responseToDelete, setResponseToDelete] = useState(null); // Response selected for deletion
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete confirmation dialog
  const [selectedReview, setSelectedReview] = useState(null); // Selected review to respond to
  const [newResponse, setNewResponse] = useState(''); // New response input value
  const [Response, setResponse] = useState(''); // New response input value
  const [openResponseDialog, setOpenResponseDialog] = useState(false); // State for response dialog
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in Snackbar
  const [snackbarType, setSnackbarType] = useState(''); // Type of message for Snackbar
  const [responseToEdit, setResponseToEdit] = useState(null); // State for the response to edit
  const [openEditDialog, setOpenEditDialog] = useState(false); // State for edit dialog visibility

  useEffect(() => {
    // Fetch reviews from Firestore
    const reviewsCollection = collection(db, 'feedback');

    const unsubscribe = onSnapshot(
      reviewsCollection,
      (snapshot) => {
        // Map Firestore documents to reviews array
        const reviewsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsList); // Update reviews state
        setLoading(false); // Set loading to false after data is fetched
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        setError('Error fetching reviews'); // Set error message
        setLoading(false); // Set loading to false
      }
    );

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Function to open delete confirmation dialog
  const confirmDeleteResponse = (review, response) => {
    setSelectedReview(review); // Set the selected review
    setResponseToDelete(response); // Set the response to delete
    setOpenDeleteDialog(true); // Open delete dialog
  };

  // Function to handle response deletion
  const handleDeleteResponse = async () => {
    if (!responseToDelete || !selectedReview) return; // Ensure valid response and review

    const reviewRef = doc(db, 'feedback', selectedReview.id); // Reference to the specific review

    try {
      // Filter out the response to be deleted
      const updatedResponses = selectedReview.responses.filter(
        (resp) => resp.timestamp !== responseToDelete.timestamp
      );

      await updateDoc(reviewRef, { responses: updatedResponses }); // Update Firestore with new responses

      // Set the snackbar message and type
      setSnackbarMessage('Your response has been deleted');
      setSnackbarType('success'); // Set message type to success
      setSnackbarOpen(true); // Open snackbar for feedback

      setOpenDeleteDialog(false); // Close delete dialog
      setResponseToDelete(null); // Reset state
      setSelectedReview(null); // Reset state
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  // Function to open dialog for adding a response
  const handleOpenResponseDialog = (review) => {
    setSelectedReview(review); // Set the selected review
    setOpenResponseDialog(true); // Open response dialog
  };

  // Function to close the response dialog
  const handleCloseResponseDialog = () => {
    setOpenResponseDialog(false); // Close dialog
    setNewResponse(''); // Reset input value
    setSelectedReview(null); // Reset selected review
  };

  // Function to handle new response submission
  const handleResponseSubmit = async () => {
    if (!newResponse || !selectedReview) return; // Ensure valid response and review
  
    const reviewRef = doc(db, 'feedback', selectedReview.id); // Reference to the specific review
    const response = {
      user: "Ananda Auto moter Techniqe", // User's name (replace with actual user's name)
      text: newResponse, // Response text
    };
  
    try {
      // Check if responses array exists, if not, initialize it as an empty array
      const updatedResponses = selectedReview.responses ? [...selectedReview.responses, response] : [response];
  
      // Update Firestore with the new response
      await updateDoc(reviewRef, {
        responses: updatedResponses,
      });
  
      handleCloseResponseDialog(); // Close dialog after submission
      setSnackbarMessage('Response added successfully');
      setSnackbarType('success');
      setSnackbarOpen(true); // Show success snackbar
    } catch (error) {
      console.error('Error adding response:', error);
      setSnackbarMessage('Error adding response');
      setSnackbarType('error');
      setSnackbarOpen(true); // Show error snackbar
    }
  };
  

  // Function to close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false); // Close dialog
    setResponseToDelete(null); // Reset state
    setSelectedReview(null); // Reset state
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false); // Close snackbar
    setSnackbarMessage(''); // Reset message
    setSnackbarType(''); // Reset message type
  };


  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <Star key={i} sx={{ color: '#ff9800' }} /> : <StarBorder key={i} sx={{ color: '#ff9800' }} />);
    }
    return stars;
  };

  if (loading) {
    return (
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">Loading reviews...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
 <>
 <Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'left', 
    mb: { xs: 5, md: 5}, 
    mt: { xs: 5, md: 20 }, 
    backgroundColor: '#f5f5f5', 
    borderRadius: '15px', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
    padding: { xs: '16px', md: '32px' } 
  }}
>
  <Typography 
    variant="h2" 
    fontWeight="700" 
    color='#03144e' 
    sx={{ 
      fontSize: { xs: '2rem', md: '3rem' }, 
      letterSpacing: '0.8px', 
      textAlign: 'left', 
      width: '130vh',
      lineHeight: 1.3, 
    }}
  >
    Feedback
  </Typography>
</Box>


<Box  className="main-box"
  sx={{ 
    height:'700px',
    maxHeight: '800px',  
    overflowY: 'auto', 
    mb: 4, 
    width: '130vh',  
    margin: '0 auto'  
  }}>
       {reviews.length > 0 ? (
  reviews.map((review) => (
    <Card
      key={review.id}
      sx={{
        borderRadius: '16px',
        boxShadow: 3,
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'visible',
        mb: 2,
      }}
    >
      <CardHeader
        className="card-header"
        avatar={<Avatar sx={{ bgcolor: '#326174',marginLeft:'30px' }}>{review.profi}</Avatar>}
        title={<Typography fontWeight="bold" color="#000" fontSize="18px">{review.name}</Typography>} 
      />
          <CardContent className="review-content"sx={{marginLeft:'80px'}} >
             {renderStars(review.rating)} 

{/* Review comment */}
<Typography variant="body1" sx={{ color: '#000', mt: 1.8,marginLeft:'5px' }} gutterBottom>
  "{review.comment}"
</Typography>

{/* Responses */}
{review.responses && review.responses.length > 0 && (
  <Box sx={{ mt: 5 }}>
    <Typography variant="subtitle1" fontWeight="bold">
      Responses:
    </Typography>
    {review.responses.map((resp) => (
      <Box
        key={resp.timestamp}
        sx={{
          mt: 1,
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '8px',
          position: 'relative',
          height: '10vh',
          width: '60rem',
          marginLeft: '40px',
        }}
      >
        <Typography variant="body1" color="#1976d2" fontWeight="bold">
          {resp.user}:
        </Typography>
        <Typography variant="body1">{resp.text}</Typography>
        <IconButton
          onClick={() => confirmDeleteResponse(review, resp)}
          sx={{
            position: 'absolute',
            right: '15px',
            top: '20px',
            marginBottom: '20px',
          }}
          color="error"
        >
          <DeleteIcon /> 
        </IconButton>
      </Box>
    ))}
  </Box>
)}


<Button
  onClick={() => handleOpenResponseDialog(review)} 
  sx={{ mt: 4 ,marginLeft:'30px' }}
  variant="contained"
  color="primary"
>
  Add Response
</Button>
</CardContent>
</Card>
))
) : (
<Typography variant="body1" color="textSecondary">
No reviews available.
</Typography>
)}
</Box>

      
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Response</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this response?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteResponse} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

       {/* Add Response Dialog */}
       <Dialog 
  open={openResponseDialog} 
  onClose={handleCloseResponseDialog} 
  sx={{ 
    '& .MuiDialog-paper': { 
      width: '600px', 
      height: 'auto', 
      borderRadius: '12px', 
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', 
    }
  }} 
>
      <DialogTitle sx={{ fontWeight: '600', fontSize: '1.5rem', color: '#1976d2' }}>Add Response</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Response"
            type="text"
            fullWidth
            variant="outlined"
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResponseSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Snackbar position
>
  <Alert onClose={handleCloseSnackbar} severity={snackbarType}>
    {snackbarMessage}
  </Alert>
</Snackbar>
      
   </>
  );
};

export default Reviews; 