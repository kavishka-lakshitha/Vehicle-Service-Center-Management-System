import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { db } from '../firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { FaCamera } from 'react-icons/fa'; 

const UserProfile = () => {
  const [username, setUsername] = useState('admin'); 
  const [firstName, setFirstName] = useState('Gayantha');
  const [email, setEmail] = useState('gayantha@gmail.com');
  const [address, setAddress] = useState('Kurunegala');
  const [password, setPassword] = useState('password123');
  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/150');
  const [isEditing, setIsEditing] = useState(false);
  const userId = 'user_id_here'; 

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUsername(userData.username || 'admin');
        setFirstName(userData.firstName);
        setEmail(userData.email);
        setAddress(userData.address);
        setPassword(userData.password);
        setProfilePhoto(userData.profilePhoto || 'https://via.placeholder.com/150');
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleChange = (field, value) => {
    if (field === 'firstName') setFirstName(value);
    if (field === 'email') setEmail(value);
    if (field === 'address') setAddress(value);
   
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);

    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          firstName,
          email,
          address,
          password,
          profilePhoto,
        },
        { merge: true }
      );

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
      </div>

      <div className="profile-content">
        <div className="profile-picture">
          <img src={profilePhoto} alt="Profile" />
          <label htmlFor="file-input" className="profile-icon-overlay">
            <FaCamera />
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            className="file-input"
            id="file-input"
          />
        </div>

        <h3 className="username-heading">{username}</h3>

        <div className="profile-info">
          <div className="info-item">
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="editable-input"
              disabled={!isEditing}
            />
          </div>

          <div className="info-item">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="editable-input"
              disabled={!isEditing}
            />
          </div>

          <div className="info-item">
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="editable-input"
              disabled={!isEditing}
            />
          </div>

        </div>

        <div className="button-container">
          <button className="edit-button" onClick={handleEditClick}>
            Edit
          </button>
          <button className="save-button" onClick={handleSaveClick} disabled={!isEditing}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;