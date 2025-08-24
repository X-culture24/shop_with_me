import React, { useState, useEffect } from 'react';
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

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart items from API
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    // Mock data for now
    setCartItems([
      {
        id: 1,
        product: {
          id: 1,
          name: 'Premium Wireless Headphones',
          price: 15999,
          images: [{ id: 1, product_id: 1, url: '/placeholder-product.jpg', alt_text: 'Headphones', is_primary: true, created_at: new Date().toISOString() }],
          category: { 
            id: 1, 
            name: 'Electronics', 
            description: 'Electronic devices and gadgets', 
            image: '', 
            children: [], 
            is_active: true, 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          },
          description: 'High-quality wireless headphones',
          stock: 10,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        quantity: 2,
        price: 15999,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        product: {
          id: 2,
          name: 'Organic Coffee Beans',
          price: 2500,
          images: [{ id: 2, product_id: 2, url: '/placeholder-product.jpg', alt_text: 'Coffee', is_primary: true, created_at: new Date().toISOString() }],
          category: { 
            id: 2, 
            name: 'Food & Beverages', 
            description: 'Food and beverage products', 
            image: '', 
            children: [], 
            is_active: true, 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          },
          description: 'Premium organic coffee beans',
          stock: 25,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        quantity: 1,
        price: 2500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + shipping + tax;

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
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  size="small"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  sx={{ width: 60 }}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Add />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => removeItem(item.id)}
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
            background: 'linear-gradient(45deg, #FF1493 30%, #000080 90%)',
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
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Shipping:</Typography>
              <Typography color={shipping === 0 ? 'success.main' : 'inherit'}>
                {shipping === 0 ? 'FREE' : `KSh ${shipping.toLocaleString()}`}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Tax (16%):</Typography>
              <Typography>KSh {tax.toLocaleString()}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                KSh {total.toLocaleString()}
              </Typography>
            </Box>

            {shipping > 0 && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Add KSh {(5000 - subtotal).toLocaleString()} more for free shipping
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={() => navigate('/checkout')}
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #FF1493 30%, #000080 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF1493 60%, #000080 100%)',
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
