/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { getDocs, collection, query } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';
import rejectImage from '../assets/image/reject.png';
import bookingImage from '../assets/image/booking.png';
import userAddImage from '../assets/image/user-add.png';
import confirmationImage from '../assets/image/confirmation.png';
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

const Dashboard = ({ isSidebarOpen }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalConfirmedServices, setTotalConfirmedServices] = useState(0);
  const [totalRejects, setTotalRejects] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const [serviceData, setServiceData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'userDetails'));
        setTotalUsers(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const bookingSnapshot = await getDocs(collection(db, 'bookings'));
        const serviceHistorySnapshot = await getDocs(collection(db, 'service_history'));
        setTotalReservations(bookingSnapshot.size + serviceHistorySnapshot.size);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchConfirmedServices = async () => {
      try {
        const q = query(collection(db, 'service_history'));
        const querySnapshot = await getDocs(q);
        setTotalConfirmedServices(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching confirmed services:', error);
      }
    };
    fetchConfirmedServices();
  }, []);

  useEffect(() => {
    const fetchRejectedServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'emailRejection'));
        setTotalRejects(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching rejected services:', error);
      }
    };
    fetchRejectedServices();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
        let total = 0;
        let count = 0;
        const distribution = [0, 0, 0, 0, 0];

        feedbackSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rating) {
            const rating = Math.round(data.rating);
            if (rating >= 1 && rating <= 5) {
              distribution[5 - rating]++;
              total += data.rating;
              count++;
            }
          }
        });

        setTotalRatings(count);
        setAverageRating(count ? total / count : 0);
        setRatingDistribution(distribution);
      } catch (error) {
        console.error('Error fetching feedback ratings:', error);
      }
    };
    fetchRatings();
  }, []);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'service_history'));
        const data = querySnapshot.docs.map((doc) => doc.data().vehicle_type.toLowerCase());
        const counts = data.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        setServiceData(counts);
      } catch (error) {
        console.error('Error fetching service data:', error);
      }
    };
    fetchServiceData();
  }, []);

  const stats = [
    {
      id: 1,
      title: 'Total Users',
      count: totalUsers,
      image: userAddImage,
      color: '#070457',
      link: '/users',
    },
    {
      id: 2,
      title: 'Total Reservations',
      count: totalReservations,
      image: bookingImage,
      color: '#070457',
      link: '/Reservation',
    },
    {
      id: 3,
      title: 'Confirmed Services',
      count: totalConfirmedServices,
      image: confirmationImage,
      color: '#070457',
      link: '/serviceHistory',
    },
    {
      id: 4,
      title: 'Rejected Services',
      count: totalRejects,
      image: rejectImage,
      color: '#070457',
      link: '/reject_reservation',
    },
  ];

  const barData = {
    labels: ['Cars', 'Buses', 'Vans', 'Lorries'],
    datasets: [
      {
        label: '',
        data: ['car', 'bus', 'van', 'lorry'].map((type) => serviceData[type] || 0),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const RatingCard = ({ averageRating, totalRatings }) => (
    <div className="rating-card">
      <div className="rating-score">
        <h1>{averageRating.toFixed(1)}</h1>
        <div className="stars">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`star ${index < Math.round(averageRating) ? 'filled' : ''}`}
            />
          ))}
        </div>
        <p>{totalRatings} reviews</p>
      </div>
      <div className="rating-breakdown">
        {[5, 4, 3, 2, 1].map((rating, index) => {
          const percentage = totalRatings ? (ratingDistribution[index] / totalRatings) * 100 : 0;
          return (
            <div className="rating-row" key={index}>
              <span>{rating}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="dashboard-subtitle">Overview of system activity</p>
        </div>
      </div>

      <div className="dashboard">
        <div className="stats-grid">
          {stats.map((stat) => (
            <Link key={stat.id} to={stat.link} className="dashboard-link">
              <div className="dashboard-box">
                <div className="dashboard-box-header">
                  <span className="count" style={{ color: stat.color }}>
                    {stat.count}
                  </span>
                  <img src={stat.image} alt={stat.title} />
                </div>
                <div className="dashboard-box-content">
                  <p>{stat.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="dashboard-main">
          <div className="chart-container">
            <div className="chart-header">
              <h2>Service Popularity</h2>
            </div>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
              style={{ height: '250px', width: '100%' }}
            />
          </div>

          <RatingCard averageRating={averageRating} totalRatings={totalRatings} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
