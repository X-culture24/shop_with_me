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
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/theme';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // For now, we'll use static categories since the backend doesn't have a categories endpoint
        const staticCategories: Category[] = [
          {
            id: 'electronics',
            name: 'Electronics',
            description: 'Smartphones, laptops, headphones, and more tech gadgets',
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=center',
            productCount: 15,
          },
          {
            id: 'health-beauty',
            name: 'Health & Beauty',
            description: 'Premium perfumes, skincare, and beauty products',
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop&crop=center',
            productCount: 8,
          },
          {
            id: 'clothing',
            name: 'Clothing',
            description: 'Fashion, shoes, accessories, and apparel',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
            productCount: 12,
          },
          {
            id: 'home-garden',
            name: 'Home & Garden',
            description: 'Home decor, furniture, and garden essentials',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
            productCount: 6,
          },
          {
            id: 'sports',
            name: 'Sports & Fitness',
            description: 'Sports equipment, fitness gear, and outdoor activities',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
            productCount: 9,
          },
          {
            id: 'books',
            name: 'Books & Media',
            description: 'Books, magazines, and educational materials',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
            productCount: 4,
          },
          {
            id: 'automotive',
            name: 'Automotive',
            description: 'Car accessories, tools, and automotive supplies',
            image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&crop=center',
            productCount: 7,
          },
          {
            id: 'food-beverages',
            name: 'Food & Beverages',
            description: 'Gourmet foods, snacks, and specialty beverages',
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',
            productCount: 11,
          },
        ];

        setCategories(staticCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryId)}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: colors.darkBlue,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Shop by Category
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 300,
            }}
          >
            Discover our wide range of products organized by categories. 
            From electronics to fashion, find exactly what you're looking for.
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Grid container spacing={4}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
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
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: colors.darkBlue,
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Chip
                        label={`${category.productCount} items`}
                        size="small"
                        sx={{
                          backgroundColor: colors.blue,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {category.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: colors.blue,
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: colors.darkBlue,
                        },
                      }}
                    >
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: colors.darkBlue,
            }}
          >
            Can't find what you're looking for?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Browse all our products or use our search feature to find specific items.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                },
              }}
            >
              View All Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
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
                },
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;
