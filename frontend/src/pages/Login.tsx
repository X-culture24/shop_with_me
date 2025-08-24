import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Lock,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { colors } from '../theme/theme';

interface LoginFormData {
  identifier: string;
  password: string;
}

interface OTPFormData {
  phone: string;
  code: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
    watch,
  } = useForm<OTPFormData>();

  const phoneValue = watch('phone');

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!phoneValue) {
      setError('Please enter your phone number');
      return;
    }

    setOtpLoading(true);
    setError('');
    try {
      await authApi.sendOTP({ phone: phoneValue, purpose: 'login' });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    setLoading(true);
    setError('');
    try {
      await loginWithOTP({ ...data, purpose: 'login' });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: `2px solid ${colors.lightGray}`,
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(45deg, ${colors.darkBlue} 30%, ${colors.blue} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue shopping
            </Typography>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            centered
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
              '& .Mui-selected': {
                color: colors.blue,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.blue,
              },
            }}
          >
            <Tab label="Email/Username" />
            <Tab label="Phone OTP" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {tabValue === 0 ? (
            <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
              <TextField
                fullWidth
                label="Email or Username"
                {...registerLogin('identifier', {
                  required: 'Email or username is required',
                })}
                error={!!loginErrors.identifier}
                helperText={loginErrors.identifier?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...registerLogin('password', {
                  required: 'Password is required',
                })}
                error={!!loginErrors.password}
                helperText={loginErrors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleOTPSubmit(onOTPSubmit)}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+254700000000"
                {...registerOTP('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                error={!!otpErrors.phone}
                helperText={otpErrors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {!otpSent ? (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={sendOTP}
                  disabled={otpLoading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {otpLoading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="OTP Code"
                    placeholder="Enter 6-digit code"
                    {...registerOTP('code', {
                      required: 'OTP code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Please enter a valid 6-digit code',
                      },
                    })}
                    error={!!otpErrors.code}
                    helperText={otpErrors.code?.message}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify & Sign In'}
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      setOtpSent(false);
                      sendOTP();
                    }}
                    disabled={otpLoading}
                  >
                    Resend OTP
                  </Button>
                </>
              )}
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                color: colors.blue,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot your password?
            </Link>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: colors.blue,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;
