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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Skeleton,
  Rating,
} from '@mui/material';
import {
  Search,
  FilterList,
  ShoppingCart,
  Favorite,
  FavoriteOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import ModernPagination from '../components/common/ModernPagination';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, searchTerm ? 500 : 0); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [currentPage, sortBy, filterCategory, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories?.map((cat: any) => cat.name) || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback categories
      setCategories(['electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'automotive', 'toys']);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          page: currentPage,
          limit: 12,
          search: searchTerm,
          sort: sortBy,
          category: filterCategory,
        },
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(255, 20, 147, 0.3)',
          },
        }}
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={
              typeof product.images?.[0] === 'string' 
                ? product.images[0] 
                : product.images?.[0]?.url || '/placeholder-product.jpg'
            }
            alt={product.name}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'white' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            {wishlist.includes(product.id) ? (
              <Favorite color="error" />
            ) : (
              <FavoriteOutlined />
            )}
          </IconButton>
          {product.discount && (
            <Chip
              label={`${product.discount}% OFF`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.category?.name}
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Rating value={4.5} size="small" readOnly />
            <Typography variant="body2" color="text.secondary" ml={1}>
              (24)
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                KSh {product.price.toLocaleString()}
              </Typography>
              {product.originalPrice && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through' }}
                >
                  KSh {product.originalPrice.toLocaleString()}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<ShoppingCart />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              sx={{
                borderRadius: 2,
                backgroundColor: '#1976d2',
              }}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ProductSkeleton = () => (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={20} width="40%" />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Skeleton variant="text" height={24} width="30%" />
          <Skeleton variant="rectangular" height={32} width={80} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
          Our Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover amazing products at great prices
        </Typography>
      </Box>

      {/* Filters */}
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1); // Reset to first page when sorting
                }}
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="rating">Best Rated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ height: 56 }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3} mb={4}>
        {loading
          ? Array.from({ length: 12 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <ProductSkeleton />
              </Grid>
            ))
          : products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
      </Grid>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center">
          <ModernPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Products;
