import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  ShoppingBag,
  Favorite,
  Security,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
  });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        country: user?.country || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement updateProfile function in AuthContext
      console.log('Profile update:', editData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setChangePasswordOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem' }}
                >
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5" gutterBottom>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                <Button
                  variant={isEditing ? "outlined" : "contained"}
                  startIcon={isEditing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<Person />} label="Personal Info" />
                <Tab icon={<ShoppingBag />} label="Order History" />
                <Tab icon={<Favorite />} label="Wishlist" />
                <Tab icon={<Security />} label="Security" />
                <Tab icon={<Notifications />} label="Preferences" />
              </Tabs>

              {/* Personal Info Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      disabled={!isEditing}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={editData.country}
                      onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      disabled={!isEditing}
                    />
                  </Grid>
                  {isEditing && (
                    <Grid item xs={12}>
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={handleEditToggle}>
                          Cancel
                        </Button>
                        <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              {/* Order History Tab */}
              <TabPanel value={tabValue} index={1}>
                {orders.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No orders yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start shopping to see your orders here
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {orders.map((order: any) => (
                      <Grid item xs={12} key={order.id}>
                        <Card>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="h6">
                                Order #{order.id}
                              </Typography>
                              <Chip
                                label={order.status}
                                color={getOrderStatusColor(order.status)}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ${order.total}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Wishlist Tab */}
              <TabPanel value={tabValue} index={2}>
                {wishlist.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Your wishlist is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add items to your wishlist to see them here
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {wishlist.map((item: any) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {item.name}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ${item.price}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Password & Security
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Security />
                            </ListItemIcon>
                            <ListItemText
                              primary="Change Password"
                              secondary="Update your password to keep your account secure"
                            />
                            <Button
                              variant="outlined"
                              onClick={() => setChangePasswordOpen(true)}
                            >
                              Change
                            </Button>
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText
                              primary="Two-Factor Authentication"
                              secondary="Add an extra layer of security to your account"
                            />
                            <Button variant="outlined">
                              Enable
                            </Button>
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Notification Preferences
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email Notifications"
                              secondary="Receive updates about your orders and promotions"
                            />
                            <Button variant="outlined">
                              Manage
                            </Button>
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Notifications />
                            </ListItemIcon>
                            <ListItemText
                              primary="Push Notifications"
                              secondary="Get notified about order updates and special offers"
                            />
                            <Button variant="outlined">
                              Configure
                            </Button>
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Profile;
