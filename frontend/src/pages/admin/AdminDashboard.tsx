import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Star,
  Dashboard,
  People,
  ShoppingCart,
  Inventory,
  AttachMoney,
  Edit,
  Delete,
  Add,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ProductForm from '../../components/admin/ProductForm';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}




const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  const [salesData, setSalesData] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (response.ok) {
          setProducts((prev) => prev.filter((p: any) => p.id !== productId));
          toast.success('Product deleted successfully');
        } else {
          toast.error('Failed to delete product');
        }
      } catch (error) {
        toast.error('Network error');
      }
    }
  };

  const handleSaveProduct = (savedProduct: any) => {
    if (editingProduct) {
      setProducts((prev) => prev.map((p: any) => p.id === savedProduct.id ? savedProduct : p));
    } else {
      setProducts((prev) => [...prev, savedProduct]);
    }
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const toggleFeatured = async (productId: number, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ featured }),
      });

      if (response.ok) {
        setProducts((prev) => prev.map((product: any) => 
          product.id === productId ? { ...product, featured } : product
        ));
        toast.success(`Product ${featured ? 'added to' : 'removed from'} featured`);
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) => prev.map((order: any) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Order status updated successfully');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };



  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        setLoading(false);
        return;
      }

      console.log('Fetching dashboard data with token:', token.substring(0, 20) + '...');
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:8080/api/admin/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats response status:', statsResponse.status);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data received:', statsData);
        setStats(statsData);
      } else {
        const errorText = await statsResponse.text();
        console.error('Stats fetch failed:', statsResponse.status, errorText);
      }

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:8080/api/admin/orders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Orders response status:', ordersResponse.status);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('Orders data received:', ordersData);
        setOrders(ordersData || []);
        
        // Generate sales data from orders
        const salesByMonth = generateSalesData(ordersData || []);
        setSalesData(salesByMonth);
      } else {
        const errorText = await ordersResponse.text();
        console.error('Orders fetch failed:', ordersResponse.status, errorText);
        setOrders([]);
        setSalesData([]);
      }

      // Fetch products
      const productsResponse = await fetch('http://localhost:8080/api/admin/products', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Products response status:', productsResponse.status);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products data received:', productsData);
        setProducts(productsData || []);
      } else {
        const errorText = await productsResponse.text();
        console.error('Products fetch failed:', productsResponse.status, errorText);
        setProducts([]);
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:8080/api/admin/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users response status:', usersResponse.status);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('Users data received:', usersData);
        setUsers(usersData || []);
      } else {
        const errorText = await usersResponse.text();
        console.error('Users fetch failed:', usersResponse.status, errorText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
      });
      setOrders([]);
      setProducts([]);
      setUsers([]);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = (ordersData: any[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const salesByMonth: { [key: string]: { revenue: number, orders: number } } = {};
    
    // Initialize all months with 0
    monthNames.forEach(month => {
      salesByMonth[month] = { revenue: 0, orders: 0 };
    });
    
    // Aggregate orders by month
    ordersData.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear && order.status === 'delivered') {
        const monthName = monthNames[orderDate.getMonth()];
        salesByMonth[monthName].revenue += order.total_amount || 0;
        salesByMonth[monthName].orders += 1;
      }
    });
    
    // Convert to array format for chart
    return monthNames.map(month => ({
      month,
      revenue: salesByMonth[month].revenue,
      orders: salesByMonth[month].orders
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="text.secondary" gutterBottom variant="h6">
                {title}
              </Typography>
              <Typography variant="h4" component="div" color={color}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ color: color, fontSize: 40 }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Box mb={4}>
        <Box display="flex" gap={2} flexWrap="wrap">
          {[
            { id: 'overview', label: 'Overview', icon: <Dashboard /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingCart /> },
            { id: 'products', label: 'Products', icon: <Inventory /> },
            { id: 'featured', label: 'Featured Products', icon: <Star /> },
            { id: 'users', label: 'Users', icon: <People /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'contained' : 'outlined'}
              startIcon={tab.icon}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<ShoppingCart />}
              color="primary.main"
              subtitle={`${stats.pendingOrders} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`KSh ${stats.totalRevenue.toLocaleString()}`}
              icon={<AttachMoney />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Products"
              value={stats.totalProducts}
              icon={<Inventory />}
              color="info.main"
              subtitle={`${stats.lowStockProducts} low stock`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Users"
              value={stats.totalUsers}
              icon={<People />}
              color="warning.main"
            />
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `KSh ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#1976d2" name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Category Chart Placeholder - Install recharts for full functionality
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders && orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>KSh {order.total}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderDetailOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Orders Tab */}
      {selectedTab === 'orders' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Orders
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders && orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e: any) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderDetailOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Products Tab */}
      {selectedTab === 'products' && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Product Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products && products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar src={product.image} variant="rounded" />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>KSh {product.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        color={product.stock < 10 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={product.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </Avatar>
                        {user.firstName} {user.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{user.totalOrders}</TableCell>
                    <TableCell>KSh {user.totalSpent}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Featured Products Tab */}
      {selectedTab === 'featured' && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Featured Products Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setProductFormOpen(true)}
              sx={{ backgroundColor: '#1976d2' }}
            >
              Add Featured Product
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products && products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar src={product.image} variant="rounded" />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>KSh {product.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.featured ? 'Featured' : 'Not Featured'}
                        color={product.featured ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleFeatured(product.id, !product.featured)}
                        sx={{ color: '#1976d2' }}
                      >
                        <Star />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditProduct(product)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteProduct(product.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailOpen} onClose={() => setOrderDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Typography><strong>Name:</strong> {selectedOrder.customerName}</Typography>
                <Typography><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
                <Typography><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={selectedOrder.status} 
                    color={getStatusColor(selectedOrder.status)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                <Typography><strong>Total Amount:</strong> KSh {selectedOrder.total}</Typography>
                <Typography><strong>Items:</strong> {selectedOrder.items?.length || 0}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                <List>
                  {selectedOrder?.items?.map((item: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar src={item.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Quantity: ${item.quantity} × KSh ${item.price}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </Container>
  );
};

export default AdminDashboard;
