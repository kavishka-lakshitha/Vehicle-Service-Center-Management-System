import React, { useEffect, useState, useRef } from 'react'; // Import useEffect and useState
import { useParams } from 'react-router-dom';
import './serviceHistoryDetails.css';
import { db } from '../../firebase';
import logo from '../../assets/logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';



function ServiceHistoryDetails() {
  const { id } = useParams(); 
  const [serviceHistory, setServiceHistory] = useState(null);
  const [userDetails, setUserDetails] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const pdfRef = useRef(null); 
  
  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        console.log('Fetching document with ID:', id); 
        const serviceHistoryDoc = await getDoc(doc(db, 'service_history', id));

        if (serviceHistoryDoc.exists()) {
          const serviceHistoryData = { id: serviceHistoryDoc.id, ...serviceHistoryDoc.data() };
          console.log('Service history data:', serviceHistoryData); 
          setServiceHistory(serviceHistoryData);

         
         const nic = serviceHistoryData.nic;
         await fetchUserDetails(nic);
       } else {
         console.log('No service history found for this ID.');
         setError('No service history found for this ID.');
       }
      } catch (error) {
        setError('Error fetching service history.');
        console.error('Error fetching service history:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async (nic) => {
      try {
          console.log('Querying user details for NIC:', nic);

          
          const userQuery = query(
              collection(db, 'userDetails'),
              where('nic', '==', nic)  
          );
          const userQuerySnapshot = await getDocs(userQuery);

          
          if (!userQuerySnapshot.empty) {
              const userDoc = userQuerySnapshot.docs[0];
              console.log('User Data Found:', userDoc.data());
              setUserDetails(userDoc.data());

          } else {
              console.log('No user found for NIC:', nic);
              setUserDetails(null); 
              setErrorMessage('No user found for this NIC.');
          }
      } catch (error) {
          console.error('Error fetching user details:', error);
          setErrorMessage('Failed to fetch user details.');
      }
  };

    fetchServiceHistory();
  }, [id]);

  const handleFormatChange = (format) => {
    setDownloadFormat(format);
  };


  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const margin = 10;


    pdf.addImage(logo, 'PNG', margin, margin, 30, 30); 
    pdf.setFontSize(20);
    pdf.setFont("Helvetica", "normal");
    pdf.text("Ananda Auto Motor Techniques", margin + 40, margin + 20);

    pdf.setFontSize(12);
    pdf.text("Ihala Malkaduwawa Road, Kurunegala, Sri Lanka.", margin, margin + 30);
    pdf.text("anandaautomoters@gmail.com | 077 462 7789", margin, margin + 40);

    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 50, 200 - margin, margin + 50); 

    pdf.setFontSize(16);
    pdf.setFont("Helvetica", "bold");
    pdf.text("SERVICE HISTORY", margin, margin + 60);

    const startY = margin + 70; 
    const spacing = 10; 

  
    pdf.setFontSize(14);
    pdf.setFont("Helvetica", "bold");
    pdf.text("User Details", margin, startY);

    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`Name: ${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : '-'}`, margin, startY + spacing);
    pdf.text(`Email: ${userDetails?.email || '-'}`, margin, startY + spacing * 2);
    pdf.text(`NIC: ${userDetails?.nic || '-'}`, margin, startY + spacing * 3);
    pdf.text(`Address: ${userDetails?.address || '-'}`, margin, startY + spacing * 4);

    const serviceStartY = startY + spacing * 6; 
    pdf.setFontSize(14);
    pdf.setFont("Helvetica", "bold");
    pdf.text("Service Details", margin, serviceStartY);

    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`Reservation Number: ${serviceHistory?.reservation_number || '-'}`, margin, serviceStartY + spacing);
    pdf.text(`Vehicle Number: ${serviceHistory?.vehicle_number || '-'}`, margin, serviceStartY + spacing * 2);
    pdf.text(`Date: ${serviceHistory?.date || '-'}`, margin, serviceStartY + spacing * 3);
    pdf.text(`Service Time Slot: ${serviceHistory?.time_slot || '-'}`, margin, serviceStartY + spacing * 4);
    pdf.text(`Vehicle Model: ${serviceHistory?.vehicle_model || '-'}`, margin, serviceStartY + spacing * 5);
    pdf.text(`Vehicle Type: ${serviceHistory?.vehicle_type || '-'}`, margin, serviceStartY + spacing * 6);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Services:", margin, serviceStartY + spacing * 8);

    pdf.setFont("Helvetica", "normal");
    const services = serviceHistory?.services ? (Array.isArray(serviceHistory.services) ? serviceHistory.services : serviceHistory.services.split(',')) : [];
    services.forEach((service, index) => {
      pdf.text(`- ${service.trim()}`, margin + 10, serviceStartY + spacing * (9 + index));
    });


    pdf.save('service_history.pdf'); 
  };
  
  const handleDownloadText = () => {
    const text = `
    SERVICE HISTORY

    User Details
    Name: ${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : '-'}
    Email: ${userDetails?.email || '-'}
    NIC: ${userDetails?.nic || '-'}
    Address: ${userDetails?.address || '-'}

    Service Details
    Reservation Number: ${serviceHistory?.reservation_number || '-'}
    Vehicle Number: ${serviceHistory?.vehicle_number || '-'}
    Date: ${serviceHistory?.date || '-'}
    Service Time Slot: ${serviceHistory?.time_slot || '-'}
    Vehicle Model: ${serviceHistory?.vehicle_model || '-'}
    Vehicle Type: ${serviceHistory?.vehicle_type || '-'}

    Services: ${serviceHistory?.services || '-'}
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_history.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    const element = pdfRef.current; 
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'service_history.png';
    link.click();
  };
  


  if (loading) {
    return <div>Loading...</div>;
  }


  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      handleDownloadPDF();
    } else if (downloadFormat === 'text') {
      handleDownloadText();
    } else if (downloadFormat === 'image') {
      handleDownloadImage();
    }
  };

  

  if (loading) {
    return <div>Loading...</div>;
  }


  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>

    <div className="serviceHistoryDetails-container"  ref={pdfRef}>
      <div className="serviceHistoryDetails-header"> 
        <div className="serviceHistoryDetails-info1">
        <div className='headermaker'>
          <div className="logo-header-container">
    <img src={logo} alt="Logo" className="logo" />
    <h2 className='mainheader'>Ananda Auto Motor Techniques</h2>
  </div>
  <div className='paragraph'>
          <p >Ihala Malkaduwawa Road,Kurunegala, Sri Lanka.<br />anandaautomoters@gmail.com | 077 462 7789</p>
          </div>
          </div>
          <hr className="separator-line" />
        </div>
      </div>
      
      <h2 className="serviceHistoryDetails-title">SERVICE HISTORY</h2>

      <div className="serviceHistoryDetails">
      <h3 className="card-title"style={{ marginTop: '20px',}}>User Details</h3>
        <div className="serviceHistoryDetail-item">
          <p className='label bold'style={{ marginTop: '20px',}}>Name:</p>
          <p className='value'style={{ marginLeft: '460px',}}>{userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='label bold'>Email:</p>
          <p className='value'style={{ marginLeft: '465px',}}>{userDetails?.email || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='label bold'>NIC:</p>
          <p className='value'style={{ marginLeft: '480px',}}>{userDetails?.nic || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='label bold'>Address:</p>
          <p className='value'style={{ marginLeft: '450px',}}>{userDetails?.address || '-'}</p>  
        </div>
      </div>

      <div className="serviceHistoryDetails">
        <hr className="separator-line" />

        <h3 className="card-title"style={{ marginTop: '20px',}}>Service Details</h3>
     
        <div className="serviceHistoryDetail-item">
          <p className='lable'style={{ marginTop: '20px',}}>Reservation Number:</p><p style={{ marginLeft: '336px',}}> {serviceHistory?.reservation_number || '-'}</p>
        </div>
     
        <div className="serviceHistoryDetail-item">
          <p className='lable'>Vehicle Number:</p><p style={{ marginLeft: '375px',}}> {serviceHistory?.vehicle_number || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='lable'>Date:</p><p style={{ marginLeft: '470px',}}> {serviceHistory?.date || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='lable'>Servic Time Slot:</p><p style={{ marginLeft: '380px',}}> {serviceHistory?.time_slot || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='lable'>Vehicle Model:</p><p style={{ marginLeft: '395px',}}>  {serviceHistory?.vehicle_model || '-'}</p>
        </div>

        <div className="serviceHistoryDetail-item">
          <p className='lable'>Vehicle Type:</p><p style={{ marginLeft: '408px',}}> {serviceHistory?.vehicle_type || '-'}</p>
        </div>

        

        <div className="serviceHistoryDetail-item">
          <p className='label1'>Services:</p>
          <div style={{ marginLeft: '450px',}}>
            {serviceHistory?.services 
              ? (Array.isArray(serviceHistory.services) 
                  ? serviceHistory.services.map((service, index) => (
                      <p key={index} className="service-item">{service}</p>
                    ))
                  : serviceHistory.services.split(',').map((service, index) => (
                      <p key={index} className="service-item">{service.trim()}</p>
                    ))
                )
              : '-'}
          </div>
          <hr className="separator-line" /> 
        </div>
      </div>
    </div>
 
   <div className="download-options">
          <select value={downloadFormat} onChange={(e) => handleFormatChange(e.target.value)}>
            <option value="pdf">Download as PDF</option>
            <option value="text">Download as Text</option>
            <option value="image">Download as Image</option>
            
          </select>
          <button onClick={handleDownload}>Download</button>
        </div>

</>
);
}

export default ServiceHistoryDetails;
