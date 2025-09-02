import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Payment,
  LocalShipping,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PaymentMethods from '../components/PaymentMethods';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
}

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<CheckoutFormData | null>(null);
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getDeliveryFee } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (activeStep === 0) {
      setOrderData(data);
      handleNext();
    } else if (activeStep === steps.length - 1) {
      await createOrder();
    }
  };

  const createOrder = async () => {
    if (!orderData) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          shippingAddress: orderData,
          items: cartItems,
          subtotal,
          deliveryFee,
          total,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        toast.success('Order created successfully!');
        navigate(`/orders/${order.id}`);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast.success('Payment completed successfully!');
    navigate('/orders');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  const orderSummary = {
    subtotal,
    deliveryFee,
    total,
  };

  const ShippingForm = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LocationOn color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Shipping Address
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              {...register('phone', { required: 'Phone number is required' })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              {...register('address', { required: 'Address is required' })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              {...register('city', { required: 'City is required' })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="County"
              {...register('county', { required: 'County is required' })}
              error={!!errors.county}
              helperText={errors.county?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Postal Code"
              {...register('postalCode')}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const PaymentForm = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Payment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Payment Method
          </Typography>
        </Box>

        <PaymentMethods
          totalAmount={orderSummary.total}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </CardContent>
    </Card>
  );

  const ReviewOrder = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <CheckCircle color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Review Your Order
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Please review your order details before confirming your purchase.
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          Your order will be processed and you'll receive a confirmation email shortly.
        </Alert>
      </CardContent>
    </Card>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ShippingForm />;
      case 1:
        return <PaymentForm />;
      case 2:
        return <ReviewOrder />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary.main" mb={4}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {getStepContent(activeStep)}

              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  size="large"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#1976d2',
                  }}
                >
                  {activeStep === steps.length - 1
                    ? loading
                      ? 'Processing...'
                      : 'Place Order'
                    : 'Next'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              position: 'sticky',
              top: 100,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>KSh {orderSummary.subtotal.toLocaleString()}</Typography>
            </Box>

            {orderSummary.deliveryFee > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Delivery Fee (Imported Products):</Typography>
                <Typography>KSh {orderSummary.deliveryFee.toLocaleString()}</Typography>
              </Box>
            )}

            {orderSummary.deliveryFee > 0 && (
              <Box display="flex" alignItems="center" color="text.secondary" mb={2}>
                <LocalShipping sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Delivery fees apply to imported products only
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                KSh {orderSummary.total.toLocaleString()}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" color="success.main">
              <LocalShipping sx={{ mr: 1 }} />
              <Typography variant="body2">
                Free delivery in 2-3 business days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
