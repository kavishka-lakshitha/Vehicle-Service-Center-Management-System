import React from 'react';
import { useNavigate } from 'react-router-dom';

function SignOutPage() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <section style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'transparent', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      <div style={{
        padding: '40px 50px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>Confirm Sign Out</h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>Are you sure you want to sign out?</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '180px',
              padding: '12px 25px',
              fontSize: '16px',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              marginRight: '20px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Yes, Sign Out
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 25px',
              fontSize: '16px',
              borderRadius: '5px',
              backgroundColor: '#f44336',
              color: '#fff',
              width: '180px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}

export default SignOutPage;
