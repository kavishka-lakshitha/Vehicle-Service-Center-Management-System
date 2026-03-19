import React, { useState, useEffect } from 'react';
import {
  Box,Typography,Paper,Table,TableCell,TableContainer,TableHead,TableRow,Select,MenuItem,FormControl,InputLabel,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore'; 

ChartJS.register(ArcElement, Tooltip, Legend);

const Service_Type = () => {
  const [serviceData, setServiceData] = useState({
    bodyWash: 0,
    bodyPolishing: 0,
    collisionCorrection: 0,
    tyreServices: 0,
    exteriorCondition: 0,
    engineTuneUps: 0,
    lubeServices: 0,
    interiorCondition: 0,
    mechanicalRepair: 0,
    interiorVacuum: 0,
    undercarriageDegreasing: 0,
  });


  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'service_history'));
      let newData = {
        bodyWash: 0,
        bodyPolishing: 0,
        collisionCorrection: 0,
        tyreServices: 0,
        exteriorCondition: 0,
        engineTuneUps: 0,
        lubeServices: 0,
        interiorCondition: 0,
        mechanicalRepair: 0,
        interiorVacuum: 0,
        undercarriageDegreasing: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const services = data.services.split(',');

        services.forEach(service => {
          const trimmedService = service.trim();
          switch (trimmedService) {
            case 'Body Wash':
              newData.bodyWash += 1;
              break;
            case 'Body Polishing':
              newData.bodyPolishing += 1;
              break;
            case 'Collision Correction':
              newData.collisionCorrection += 1;
              break;
            case 'Tyre Services':
              newData.tyreServices += 1;
              break;
            case 'Exterior Condition':
              newData.exteriorCondition += 1;
              break;
            case 'Engine Tune-Ups':
              newData.engineTuneUps += 1;
              break;
            case 'Lube Services':
              newData.lubeServices += 1;
              break;
            case 'Interior Condition':
              newData.interiorCondition += 1;
              break;
            case 'Mechanical Repair':
              newData.mechanicalRepair += 1;
              break;
              case 'Interior Vacuum':
              newData.interiorVacuum += 1;
              break;
              case 'Undercarriage Degreasing':
              newData.undercarriageDegreasing += 1;
              break;
            default:
              break;
          }
        });
      });

      setServiceData(newData);
    };

    fetchData();
  }, []);

  const totalBase = Object.values(serviceData).reduce((a, b) => a + b, 0);
  const percentages = {
    bodyWash: totalBase ? ((serviceData.bodyWash / totalBase) * 100).toFixed(2) : 0,
    bodyPolishing: totalBase ? ((serviceData.bodyPolishing / totalBase) * 100).toFixed(2) : 0,
    collisionCorrection: totalBase ? ((serviceData.collisionCorrection / totalBase) * 100).toFixed(2) : 0,
    tyreServices: totalBase ? ((serviceData.tyreServices / totalBase) * 100).toFixed(2) : 0,
    exteriorCondition: totalBase ? ((serviceData.exteriorCondition / totalBase) * 100).toFixed(2) : 0,
    engineTuneUps: totalBase ? ((serviceData.engineTuneUps / totalBase) * 100).toFixed(2) : 0,
    lubeServices: totalBase ? ((serviceData.lubeServices / totalBase) * 100).toFixed(2) : 0,
    interiorCondition: totalBase ? ((serviceData.interiorCondition / totalBase) * 100).toFixed(2) : 0,
    mechanicalRepair: totalBase ? ((serviceData.mechanicalRepair / totalBase) * 100).toFixed(2) : 0,
    interiorVacuum: totalBase ? ((serviceData.interiorVacuum / totalBase) * 100).toFixed(2) : 0,
    undercarriageDegreasing: totalBase ? ((serviceData.undercarriageDegreasing / totalBase) * 100).toFixed(2) : 0,
  };

  const pieData = {
    labels: [
      'Body Wash', 
      'Body Polishing', 
      'Collision Correction', 
      'Tyre Services',
      'Exterior Condition',
      'Engine Tune-Ups',
      'Lube Services',
      'Interior Condition',
      'Mechanical Repair',
      'Interior Vacuum ',
      'undercarriage Degreasing',
    ],
    datasets: [
      {
        label: 'Percentage of Services',
        data: [
          percentages.bodyWash,
          percentages.bodyPolishing,
          percentages.collisionCorrection,
          percentages.tyreServices,
          percentages.exteriorCondition,
          percentages.engineTuneUps,
          percentages.lubeServices,
          percentages.interiorCondition,
          percentages.mechanicalRepair,
          percentages.interiorVacuum,
          percentages.undercarriageDegreasing,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', 
          'rgba(54, 162, 235, 0.6)',  
          'rgba(355, 110, 86, 0.6)',  
          'rgba(75, 192, 192, 0.6)',  
          'rgba(153, 102, 255, 0.6)', 
          'rgba(255, 159, 64, 0.6)',  
          'rgba(128, 128, 240, 0.6)', 
          'rgba(100, 181, 246, 0.6)', 
          'rgba(205, 150, 350, 0.6)', 
          'rgba(85, 99, 132, 0.6)', 
          'rgba(354, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',   
          'rgba(255, 99, 132, 1)',    
          'rgba(255, 206, 86, 1)',   
          'rgba(54, 162, 235, 1)',    
          'rgba(153, 102, 255, 1)',   
          'rgba(255, 159, 64, 1)',   
          'rgba(85, 85, 200, 1)',     
          'rgba(70, 130, 180, 1)',    
          'rgba(220, 200, 100, 1)', 
          'rgba(175, 192, 192, 1)',   
          'rgba(155, 99, 132, 1)',    
        ],
        borderWidth: 1,
        
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Box className="statistics-container" display="flex" flexDirection="column"  alignItems="flex-start" sx={{ paddingTop: '20px', marginTop:'280px' }}>
      <Box display="flex" width="100%" justifyContent="space-between" marginBottom={2}>
        <Typography variant="h2" component="h1" gutterBottom >
          Service Statistics by Service Type
        </Typography>
      </Box>

      <Paper elevation={3}>
        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow className="table-heading">
                <TableCell><strong>Metric</strong></TableCell>
                <TableCell align="center"><strong>Body Wash</strong></TableCell>
                <TableCell align="center"><strong>Body Polishing</strong></TableCell>
                <TableCell align="center"><strong>Collision Correction</strong></TableCell>
                <TableCell align="center"><strong>Tyre Replacements</strong></TableCell>
                <TableCell align="center"><strong>Paint correction</strong></TableCell>
                <TableCell align="center"><strong>Spare part Replacement</strong></TableCell>
                <TableCell align="center"><strong>Engine Tune-Ups</strong></TableCell>
                <TableCell align="center"><strong>Battery service</strong></TableCell>
                <TableCell align="center"><strong>Lube Services</strong></TableCell>
                <TableCell align="center"><strong>Interior vacuum & cleaning</strong></TableCell>
                <TableCell align="center"><strong>Undercarriage degreasing</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableRow>
              <TableCell>Total Services</TableCell>
              <TableCell align="center">{serviceData.bodyWash}</TableCell>
              <TableCell align="center">{serviceData.bodyPolishing}</TableCell>
              <TableCell align="center">{serviceData.collisionCorrection}</TableCell>
              <TableCell align="center">{serviceData.tyreServices}</TableCell>
              <TableCell align="center">{serviceData.exteriorCondition}</TableCell>
              <TableCell align="center">{serviceData.engineTuneUps}</TableCell>
              <TableCell align="center">{serviceData.lubeServices}</TableCell>
              <TableCell align="center">{serviceData.interiorCondition}</TableCell>
              <TableCell align="center">{serviceData.mechanicalRepair}</TableCell>
              <TableCell align="center">{serviceData.interiorVacuum}</TableCell>
              <TableCell align="center">{serviceData.undercarriageDegreasing}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage (%)</TableCell>
              <TableCell align="center">{percentages.bodyWash}%</TableCell>
              <TableCell align="center">{percentages.bodyPolishing}%</TableCell>
              <TableCell align="center">{percentages.collisionCorrection}%</TableCell>
              <TableCell align="center">{percentages.tyreServices}%</TableCell>
              <TableCell align="center">{percentages.exteriorCondition}%</TableCell>
              <TableCell align="center">{percentages.engineTuneUps}%</TableCell>
              <TableCell align="center">{percentages.lubeServices}%</TableCell>
              <TableCell align="center">{percentages.interiorCondition}%</TableCell>
              <TableCell align="center">{percentages.mechanicalRepair}%</TableCell>
              <TableCell align="center">{percentages.interiorVacuum}%</TableCell>
              <TableCell align="center">{percentages.undercarriageDegreasing}%</TableCell>
            </TableRow>
          </Table>
        </TableContainer>
      </Paper>

      <Box marginTop={3} width="100%">
        <Typography variant="h4">Service Distribution</Typography>
        <Paper elevation={3}>
          <Box style={{ height: '600px', position: 'relative' }}>
            <Pie data={pieData} options={pieOptions} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Service_Type;