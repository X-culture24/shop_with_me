import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Notifications,
  Search,
  Favorite,
  Dashboard,
  Logout,
  Person,
  ShoppingBag,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/theme';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <ShoppingBag /> },
    { label: 'Products', path: '/products', icon: <Search /> },
    { label: 'Categories', path: '/categories', icon: <MenuIcon /> },
  ];

  const userMenuItems = isAuthenticated
    ? [
        { label: 'Profile', path: '/profile', icon: <Person /> },
        { label: 'Orders', path: '/orders', icon: <ShoppingBag /> },
        { label: 'Wishlist', path: '/wishlist', icon: <Favorite /> },
        ...(isAdmin ? [{ label: 'Admin Dashboard', path: '/admin', icon: <Dashboard /> }] : []),
      ]
    : [];

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #FFFFFF 30%, #FFB6C1 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              SakiFarm
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Icon */}
            <IconButton
              color="inherit"
              onClick={() => navigate('/search')}
              sx={{ color: 'white' }}
            >
              <Search />
            </IconButton>

            {/* Cart */}
            <IconButton
              color="inherit"
              onClick={() => navigate('/cart')}
              sx={{ color: 'white' }}
            >
              <Badge badgeContent={0} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Notifications */}
            {isAuthenticated && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/notifications')}
                sx={{ color: 'white' }}
              >
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0, ml: 1 }}
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.first_name}
                    sx={{
                      bgcolor: colors.blue,
                      border: '2px solid white',
                    }}
                  >
                    {user?.first_name?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="textSecondary">
                      {user?.first_name} {user?.last_name}
                    </Typography>
                  </MenuItem>
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  variant="outlined"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: colors.blue,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: colors.darkBlue,
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: 'white', ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: `linear-gradient(180deg, ${colors.darkBlue} 0%, ${colors.blue} 100%)`,
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
            Menu
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            {isAuthenticated && userMenuItems.map((item) => (
              <ListItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
