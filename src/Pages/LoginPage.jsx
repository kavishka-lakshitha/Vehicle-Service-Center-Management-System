/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox,
    Link,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [open, setOpen] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                navigate('/dashboard');
            } else {
                setIsAuthenticated(false);
            }
        });

        return () => unsubscribe();
    }, [auth, navigate, setIsAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const userRefOwner = doc(db, 'users', 'owner');
        const userRefAdmin = doc(db, 'users', 'admin');
        try {
           
            const ownerDocSnap = await getDoc(userRefOwner);
            if (ownerDocSnap.exists()) {
                const ownerData = ownerDocSnap.data();
                if (ownerData.username === username && ownerData.password === password) {
                    if (rememberMe) {
                        localStorage.setItem('username', username);
                    }
                    setIsAuthenticated(true);
                    navigate('/owner-dashboard');
                    return;
                }
            }

     
            const adminDocSnap = await getDoc(userRefAdmin);
            if (adminDocSnap.exists()) {
                const adminData = adminDocSnap.data();
                if (adminData.username === username && adminData.password === password) {
                    if (rememberMe) {
                        localStorage.setItem('username', username);
                    }
                    setIsAuthenticated(true);
                    navigate('/admin-dashboard');
                    return;
                }
            }


            alert('Invalid username or password');
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Error fetching user');
        }
    };

    const handleOpenForgotPassword = () => setOpen(true);
    const handleCloseForgotPassword = () => setOpen(false);

    const handlePasswordReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent!');
            handleCloseForgotPassword();
            handleOpenChangePassword();
        } catch (error) {
            console.error('Error sending password reset email:', error);
            alert('Failed to send password reset email.');
        }
    };

    const handleOpenChangePassword = () => setOpenChangePassword(true);
    const handleCloseChangePassword = () => {
        setOpenChangePassword(false);
        setNewPassword('');
    };

    const handleChangePassword = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await updatePassword(user, newPassword);
                alert('Password changed successfully!');
                handleCloseChangePassword();
            } catch (error) {
                console.error('Error changing password:', error);
                alert('Failed to change password.');
            }
        } else {
            alert('No user is authenticated. Please log in first.');
        }
    };

    return (
        <Paper elevation={6} className="login-paper"
        sx={{
            width: '400px', 
            height: '400px', 
            padding: '24px', 
            margin: 'auto', 
        }}>
            <Typography variant="h4" className="login-title">Login</Typography>
            <form onSubmit={handleLogin}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-field"
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-field"
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" marginTop="8px" marginBottom="24px">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Remember Me"
                    />
                    <Link href="#" variant="body2" onClick={handleOpenForgotPassword}>
                        Forgot Password?
                    </Link>
                </Box>
                <Button type="submit" fullWidth variant="contained" color="primary" className="login-button">
                    Login
                </Button>
            </form>

            

            <Dialog open={open} onClose={handleCloseForgotPassword}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasswordReset} variant="contained" color="primary">
                        Send Reset Email
                    </Button>
                    <Button onClick={handleCloseForgotPassword} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openChangePassword} onClose={handleCloseChangePassword}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Enter your new password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChangePassword} variant="contained" color="primary">
                        Change Password
                    </Button>
                    <Button onClick={handleCloseChangePassword} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default LoginPage;
