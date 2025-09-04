import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  Chip,
  IconButton,
  Card,
  Avatar,
  TextField,
  Tab,
  Tabs,
  Badge,
  ImageList,
  ImageListItem,
  Skeleton,
} from '@mui/material';
import {
  FavoriteOutlined,
  Favorite,
  ShoppingCart,
  Share,
  Add,
  Remove,
  ThumbUp,
  Reply,
  Send,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Product, Review } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewText,
      });
      
      setReviews(prev => [response.data, ...prev]);
      setReviewText('');
      setReviewRating(5);
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewAction = async (reviewId: number, action: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Please login to interact with reviews');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/${action}`);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      toast.error(`Failed to ${action} review`);
    }
  };

  const handleReplyClick = (reviewId: number) => {
    if (!user) {
      toast.error('Please login to reply to reviews');
      return;
    }
    setReplyingTo(reviewId);
    setReplyText('');
  };

  const handleSubmitReply = async (reviewId: number) => {
    if (!user) {
      toast.error('Please login to reply to reviews');
      return;
    }

    if (!replyText.trim()) {
      toast.error('Please write a reply');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/reply`, {
        comment: replyText,
      });
      
      setReplyingTo(null);
      setReplyText('');
      fetchReviews(); // Refresh reviews to show the new reply
      toast.success('Reply submitted successfully');
    } catch (error) {
      toast.error('Failed to submit reply');
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={60} width="60%" />
            <Skeleton variant="text" height={30} width="40%" />
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Product not found</Typography>
      </Container>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 2 }}>
              <img
                src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 12,
                }}
              />
            </Box>
            
            {product.images && product.images.length > 1 && (
              <ImageList cols={4} gap={8}>
                {product.images.map((image, index) => (
                  <ImageListItem 
                    key={index}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : 'none',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      style={{ height: 80, objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </motion.div>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Chip label={product.category?.name} color="primary" size="small" />
              <Chip 
                label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                color={product.stock > 0 ? 'success' : 'error'} 
                size="small" 
              />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={averageRating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({reviews.length} reviews)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary.main" fontWeight="bold" mb={2}>
              KSh {product.price.toLocaleString()}
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={3}>
              {product.description}
            </Typography>

            {/* Quantity Selector */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Typography variant="body1">Quantity:</Typography>
              <Box display="flex" alignItems="center" border="1px solid #ddd" borderRadius={1}>
                <IconButton 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                ({product.stock} available)
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
                sx={{
                  flex: 1,
                  backgroundColor: '#1976d2',
                  borderRadius: 2,
                }}
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <IconButton
                onClick={() => setIsWishlisted(!isWishlisted)}
                sx={{ border: '1px solid #ddd' }}
              >
                {isWishlisted ? <Favorite color="error" /> : <FavoriteOutlined />}
              </IconButton>
              <IconButton sx={{ border: '1px solid #ddd' }}>
                <Share />
              </IconButton>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Description" />
          <Tab 
            label={
              <Badge badgeContent={reviews.length} color="primary">
                Reviews
              </Badge>
            } 
          />
          <Tab label="Specifications" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {product.description}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Write Review Section */}
          {user && (
            <Card sx={{ mb: 4, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="body2">Rating:</Typography>
                <Rating
                  value={reviewRating}
                  onChange={(_, value) => setReviewRating(value || 5)}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Card>
          )}

          {/* Reviews List */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Customer Reviews ({reviews.length})
            </Typography>
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} sx={{ mb: 2, p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {review.user.first_name?.[0] || 'U'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.user.first_name} {review.user.last_name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={review.rating} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={2}>
                    {review.comment}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      size="small"
                      startIcon={<ThumbUp />}
                      onClick={() => handleReviewAction(review.id, 'like')}
                    >
                      Helpful
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Reply />}
                      onClick={() => handleReplyClick(review.id)}
                    >
                      Reply
                    </Button>
                  </Box>
                  
                  {/* Display Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <Box mt={2} ml={4}>
                      {review.replies.map((reply) => (
                        <Card key={reply.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50' }}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                              {reply.user.first_name?.[0] || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {reply.user.first_name} {reply.user.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ ml: 5 }}>
                            {reply.comment}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Replying to {review.user.first_name}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={!replyText.trim()}
                        >
                          Submit Reply
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCancelReply}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Card>
              ))
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">SKU:</Typography>
              <Typography variant="body1">{product.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Category:</Typography>
              <Typography variant="body1">{product.category?.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Stock:</Typography>
              <Typography variant="body1">{product.stock} units</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Status:</Typography>
              <Typography variant="body1">{product.status}</Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProductDetail;
