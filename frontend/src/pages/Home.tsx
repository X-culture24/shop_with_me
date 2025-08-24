import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Rating,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  FavoriteOutlined,
  ShoppingCartOutlined,
  TrendingUp,
  LocalShipping,
  Security,
  Support,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { colors } from '../theme/theme';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsApi.getProducts({ limit: 8 });
        setFeaturedProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        // Set mock data as fallback
        setFeaturedProducts([
          {
            id: 1,
            name: 'Premium Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: 15999,
            stock: 10,
            rating: 4.5,
            review_count: 128,
            status: 'active' as const,
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
            images: [{ 
              id: 1, 
              product_id: 1, 
              url: '/placeholder-product.jpg', 
              alt_text: 'Headphones', 
              is_primary: true, 
              created_at: new Date().toISOString() 
            }],
            createdAt: new Date(),
            updatedAt: new Date(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Organic Coffee Beans',
            description: 'Premium organic coffee beans from local farms',
            price: 2500,
            stock: 25,
            rating: 4.8,
            review_count: 89,
            status: 'active' as const,
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
            images: [{ 
              id: 2, 
              product_id: 2, 
              url: '/placeholder-product.jpg', 
              alt_text: 'Coffee', 
              is_primary: true, 
              created_at: new Date().toISOString() 
            }],
            createdAt: new Date(),
            updatedAt: new Date(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: <LocalShipping fontSize="large" />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure Payments',
      description: 'M-Pesa, Airtel Money & secure payment options',
    },
    {
      icon: <Support fontSize="large" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Quality Products',
      description: 'Curated selection of premium products',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: colors.darkBlue,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  Welcome to SakiFarm
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                  }}
                >
                  Your one-stop destination for quality products with secure payments and fast delivery
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/products')}
                    sx={{
                      backgroundColor: colors.blue,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: colors.darkBlue,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/categories')}
                    sx={{
                      borderColor: colors.blue,
                      color: colors.blue,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: colors.blue,
                        color: 'white',
                        borderColor: colors.blue,
                      },
                    }}
                  >
                    Browse Categories
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: 3,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Search Products
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSearch} sx={{ color: 'white' }}>
                            <Search />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.blue,
                        },
                      },
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            color: colors.darkBlue,
          }}
        >
          Why Choose SakiFarm?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    border: `2px solid transparent`,
                    '&:hover': {
                      borderColor: colors.blue,
                      transform: 'translateY(-5px)',
                      boxShadow: `0 10px 30px rgba(255, 20, 147, 0.2)`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      color: colors.blue,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ backgroundColor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              color: colors.darkBlue,
            }}
          >
            Featured Products
          </Typography>
          <Grid container spacing={3}>
            {featuredProducts && featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 30px rgba(0, 0, 0, 0.15)`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': {
                            backgroundColor: colors.blue,
                            color: 'white',
                          },
                        }}
                      >
                        <FavoriteOutlined />
                      </IconButton>
                      {product.stock < 10 && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: colors.blue,
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating
                          value={product.rating || 0}
                          readOnly
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({product.review_count || 0})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: colors.blue,
                          }}
                        >
                          KES {product.price.toLocaleString()}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: colors.blue,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: colors.darkBlue,
                            },
                          }}
                        >
                          <ShoppingCartOutlined />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography variant="h6" align="center" color="text.secondary">
                  {loading ? 'Loading products...' : 'No products available'}
                </Typography>
              </Grid>
            )}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
