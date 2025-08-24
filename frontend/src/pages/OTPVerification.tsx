import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { Security, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';
  const phone = location.state?.phone || '';
  const isLogin = location.state?.isLogin || false;

  useEffect(() => {
    if (!email && !phone) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, phone, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/verify-login-otp' : '/api/auth/verify-otp';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success('Login successful!');
          navigate('/');
        } else {
          toast.success('Account verified successfully!');
          navigate('/login');
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/resend-login-otp' : '/api/auth/resend-otp';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent successfully!');
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Verify OTP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We've sent a 6-digit code to
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {email || phone}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP}>
            <Box mb={4}>
              <Grid container spacing={1} justifyContent="center">
                {otp.map((digit, index) => (
                  <Grid item key={index}>
                    <TextField
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                        },
                      }}
                      sx={{
                        width: 56,
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 3 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleResendOTP}
              disabled={countdown > 0 || resendLoading}
            >
              {countdown > 0 
                ? `Resend in ${countdown}s` 
                : resendLoading 
                  ? 'Sending...' 
                  : 'Resend OTP'
              }
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default OTPVerification;
