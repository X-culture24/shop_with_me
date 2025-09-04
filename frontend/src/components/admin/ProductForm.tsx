import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Add,
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  tags: string[] | string;
  sku: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  status: 'active' | 'inactive' | 'draft';
  is_imported?: boolean;
  shipping_fee?: number;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  product,
  onSave,
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
    tags: [],
    sku: '',
    weight: 0,
    dimensions: '',
    brand: '',
    status: 'active',
    is_imported: false,
    shipping_fee: 0,
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Books',
    'Toys & Games',
    'Food & Beverages',
    'Automotive',
    'Other',
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        tags: typeof product.tags === 'string' 
          ? (product.tags as string).split(',').filter((tag: string) => tag.trim() !== '') 
          : Array.isArray(product.tags) 
            ? product.tags 
            : [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        images: [],
        tags: [],
        sku: generateSKU(),
        weight: 0,
        dimensions: '',
        brand: '',
        status: 'active',
        is_imported: false,
        shipping_fee: 0,
      });
    }
  }, [product, open]);

  const generateSKU = () => {
    return 'SKU-' + Date.now().toString().slice(-8);
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setImageUploading(true);
    const uploadedImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.imageUrl);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Error uploading images');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(Array.isArray(prev.tags) ? prev.tags : []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.filter(tag => tag !== tagToRemove) : [],
    }));
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl('');
      toast.success('Image URL added successfully');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.category || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const url = product 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedProduct = await response.json();
        onSave(savedProduct);
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {product ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              helperText="Stock Keeping Unit"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />
          </Grid>

          {/* Pricing & Inventory */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Pricing & Inventory
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Price (KES) *"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Physical Properties */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Physical Properties
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dimensions (L x W x H cm)"
              value={formData.dimensions}
              onChange={(e) => handleInputChange('dimensions', e.target.value)}
              placeholder="e.g., 30 x 20 x 10"
            />
          </Grid>

          {/* Shipping Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Shipping Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_imported || false}
                  onChange={(e) => handleInputChange('is_imported', e.target.checked)}
                />
              }
              label="Imported Product (requires shipping)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipping Fee (KES)"
              type="number"
              value={formData.shipping_fee}
              onChange={(e) => handleInputChange('shipping_fee', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={!formData.is_imported}
              helperText={formData.is_imported ? "Additional shipping charge for imported products" : "Only imported products have shipping fees"}
            />
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Product Images
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUpload />}
                  disabled={imageUploading}
                  sx={{ mr: 2 }}
                >
                  {imageUploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              </label>
            </Box>

            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                label="Or add image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                placeholder="https://example.com/image.jpg"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddImageUrl}
                startIcon={<Add />}
                disabled={!imageUrl.trim()}
              >
                Add URL
              </Button>
            </Box>

            {formData.images.length > 0 && (
              <Grid container spacing={2}>
                {formData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box position="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Tags
            </Typography>
            
            <Box display="flex" gap={1} mb={2}>
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                startIcon={<Add />}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1}>
              {Array.isArray(formData.tags) && formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {formData.images.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                Adding product images will help customers better understand your product.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;
