import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getDeliveryFee } = useCart();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      removeFromCart(item.product.id);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  const CartItemCard = ({ item }: { item: CartItem }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={2}>
              <Avatar
                src={item.product.images?.[0]?.url}
                alt={item.product.name}
                sx={{ width: 80, height: 80, borderRadius: 2 }}
                variant="rounded"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {item.product.name}
              </Typography>
              <Chip
                label={item.product.category?.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                KSh {item.price.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  size="small"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  sx={{ width: 60 }}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Add />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Add some products to get started
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
          sx={{
            borderRadius: 2,
            backgroundColor: '#1976d2',
          }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mb: 2 }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Shopping Cart ({cartItems.length} items)
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
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
              <Typography>KSh {subtotal.toLocaleString()}</Typography>
            </Box>
            
            {deliveryFee > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Delivery Fee (Imported Products):</Typography>
                <Typography>KSh {deliveryFee.toLocaleString()}</Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                KSh {total.toLocaleString()}
              </Typography>
            </Box>

            {deliveryFee > 0 && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Delivery fees apply to imported products only
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
              sx={{
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
