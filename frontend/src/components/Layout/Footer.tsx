import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { colors } from '../../theme/theme';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${colors.darkBlue} 0%, ${colors.black} 100%)`,
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${colors.blue} 30%, ${colors.lightBlue} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SakiFarm
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
              Your trusted partner for quality products and seamless delivery experience.
              We bring the best to your doorstep with secure payments and reliable service.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, index) => (
                <IconButton
                  key={index}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      color: colors.blue,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Links
            </Typography>
            {[
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'About Us', path: '/about' },
              { name: 'Contact', path: '/contact' },
              { name: 'FAQ', path: '/faq' }
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': {
                    color: colors.blue,
                  },
                  transition: 'color 0.3s ease',
                }}
              >
                {link.name}
              </Link>
            ))}
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Customer Service
            </Typography>
            {[
              { name: 'Help Center', path: '/faq' },
              { name: 'Track Order', path: '/profile' },
              { name: 'Returns', path: '/faq' },
              { name: 'Shipping Info', path: '/faq' },
              { name: 'Support', path: '/contact' }
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': {
                    color: colors.blue,
                  },
                  transition: 'color 0.3s ease',
                }}
              >
                {link.name}
              </Link>
            ))}
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, color: colors.blue }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                support@sakifarm.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, color: colors.blue }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                +254 700 000 000
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: colors.blue }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Nairobi, Kenya
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Available 24/7 for customer support
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © {currentYear} SakiFarm. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[
              { name: 'Privacy Policy', path: '/privacy' },
              { name: 'Terms of Service', path: '/terms' },
              { name: 'Contact Us', path: '/contact' }
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: colors.blue,
                  },
                  transition: 'color 0.3s ease',
                }}
              >
                {link.name}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
