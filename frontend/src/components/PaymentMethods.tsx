import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Phone, CreditCard, AccountBalance } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface PaymentMethodsProps {
  totalAmount: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: <Phone />,
      description: 'Pay with M-Pesa mobile money',
      color: '#00A651',
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: <Phone />,
      description: 'Pay with Airtel Money',
      color: '#FF0000',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard />,
      description: 'Pay with Visa, Mastercard',
      color: '#1976d2',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <AccountBalance />,
      description: 'Direct bank transfer',
      color: '#4caf50',
    },
  ];

  const validatePhoneNumber = (phone: string) => {
    const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return kenyanPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    return '254' + cleaned;
  };

  const handleMobilePayment = async (provider: 'mpesa' | 'airtel') => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/payments/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          provider,
          phoneNumber: formattedPhone,
          amount: totalAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentStatus('success');
        toast.success(`${provider === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} payment initiated. Check your phone for the payment prompt.`);
        
        // Poll for payment status
        pollPaymentStatus(data.transactionId);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error: any) {
      setPaymentStatus('error');
      onPaymentError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/status/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (data.status === 'completed') {
          onPaymentSuccess(data);
          toast.success('Payment completed successfully!');
          return;
        }

        if (data.status === 'failed') {
          onPaymentError('Payment failed or was cancelled');
          toast.error('Payment failed or was cancelled');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          onPaymentError('Payment timeout. Please try again.');
          toast.error('Payment timeout. Please try again.');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    };

    poll();
  };

  const handleCardPayment = async () => {
    // Implement card payment logic here
    toast.info('Card payment integration coming soon!');
  };

  const handleBankTransfer = async () => {
    // Implement bank transfer logic here
    toast.info('Bank transfer integration coming soon!');
  };

  const handlePayment = () => {
    switch (selectedMethod) {
      case 'mpesa':
        handleMobilePayment('mpesa');
        break;
      case 'airtel':
        handleMobilePayment('airtel');
        break;
      case 'card':
        handleCardPayment();
        break;
      case 'bank':
        handleBankTransfer();
        break;
      default:
        toast.error('Please select a payment method');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Select Payment Method
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} key={method.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedMethod === method.id ? 2 : 1,
                      borderColor: selectedMethod === method.id ? method.color : 'divider',
                      '&:hover': {
                        borderColor: method.color,
                      },
                    }}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent>
                      <FormControlLabel
                        value={method.id}
                        control={<Radio sx={{ color: method.color }} />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ color: method.color }}>
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {method.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ margin: 0, width: '100%' }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>

      {(selectedMethod === 'mpesa' || selectedMethod === 'airtel') && (
        <Box mt={3}>
          <TextField
            fullWidth
            label="Phone Number"
            placeholder="0712345678 or +254712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            helperText="Enter your mobile number to receive payment prompt"
          />
        </Box>
      )}

      {paymentStatus === 'processing' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography>
              Payment request sent. Please check your phone and complete the payment.
            </Typography>
          </Box>
        </Alert>
      )}

      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">
          Total: KES {totalAmount.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handlePayment}
          disabled={loading || paymentStatus === 'processing'}
          sx={{ px: 4 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay KES ${totalAmount.toLocaleString()}`
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentMethods;
