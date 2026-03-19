import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableContainer, TableHead, TableRow, TableCell } from '@mui/material';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Vehicle_Type = () => {
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'service_history')); 
        const data = querySnapshot.docs.map(doc => ({
          reservation_number: doc.data().reservation_number, 
          date: doc.data().date,
          vehicle_type: doc.data().vehicle_type, 
        }));
        setServiceData(data);
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, []);


  const totalCounts = serviceData.reduce((totals, entry) => {
    const vehicleType = entry.vehicle_type.toLowerCase(); 
    if (vehicleType === 'car') {
      totals.car = (totals.car || 0) + 1; 
    } else if (vehicleType === 'bus') {
      totals.bus = (totals.bus || 0) + 1; 
    } else if (vehicleType === 'van') {
      totals.van = (totals.van || 0) + 1; 
    } else if (vehicleType === 'lorry') {
      totals.lorry = (totals.lorry || 0) + 1;
    }
    return totals;
  }, {});


  const barData = {
    labels: ['Cars', 'Bus', 'Vans', 'Lorry'],
    datasets: [
      {
        label: 'Number of Services',
        data: [
          totalCounts.car || 0,
          totalCounts.bus || 0,
          totalCounts.van || 0,
          totalCounts.lorry || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box className="statistics-container"display="flex" flexDirection="column"  alignItems="flex-start" sx={{ paddingTop: '20px', marginTop:'320px' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Service Statistics by Vehicle Type
      </Typography>

   
      <Paper elevation={3}>
        <TableContainer className="table-container">
          <Table stickyHeader style={{ width: '1200px', minHeight: '100px' }}>
            <TableHead>
              <TableRow className="table-heading">
                <TableCell><strong>Total Services</strong></TableCell>
                <TableCell align="right"style={{ fontSize: '18px' }}><strong>{totalCounts.car || 0}</strong> Cars</TableCell>
                <TableCell align="right"style={{ fontSize: '18px' }} ><strong>{totalCounts.bus || 0}</strong> Bus</TableCell>
                <TableCell align="right"style={{ fontSize: '18px' }}><strong>{totalCounts.van || 0}</strong> Vans</TableCell>
                <TableCell align="right"style={{ fontSize: '18px' }}><strong>{totalCounts.lorry || 0}</strong> Lorry</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Paper>

     
      <Box marginTop={10} sx={{ height: 800, width: 1200, }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Services Distribution (Bar Chart)
        </Typography>
        <Bar data={barData} />
      </Box>
    </Box>
  );
};

export default Vehicle_Type;