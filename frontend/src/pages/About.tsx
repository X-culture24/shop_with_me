import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
} from '@mui/material';
import { Store, Security, LocalShipping, Support } from '@mui/icons-material';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const features = [
    {
      icon: <Store />,
      title: 'Quality Products',
      description: 'We source only the highest quality products from trusted suppliers and manufacturers.',
    },
    {
      icon: <Security />,
      title: 'Secure Shopping',
      description: 'Your data and payments are protected with industry-standard security measures.',
    },
    {
      icon: <LocalShipping />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across Kenya with real-time tracking.',
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Our customer support team is always ready to help you with any questions.',
    },
  ];

  const team = [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      avatar: 'JD',
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      avatar: 'JS',
    },
    {
      name: 'Mike Johnson',
      role: 'Head of Operations',
      avatar: 'MJ',
    },
    {
      name: 'Sarah Wilson',
      role: 'Customer Success Manager',
      avatar: 'SW',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            About SakiFarm
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
            We're passionate about bringing you the best shopping experience with quality products, 
            secure payments, and exceptional customer service.
          </Typography>
        </Box>

        {/* Story Section */}
        <Paper sx={{ p: 4, mb: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Our Story
              </Typography>
              <Typography variant="body1" paragraph>
                Founded in 2024, SakiFarm started with a simple mission: to make quality products 
                accessible to everyone across Kenya. What began as a small online store has grown 
                into a trusted platform serving thousands of customers.
              </Typography>
              <Typography variant="body1" paragraph>
                We believe in the power of technology to connect people with the products they need, 
                when they need them. Our platform combines the convenience of online shopping with 
                the reliability of traditional retail.
              </Typography>
              <Typography variant="body1">
                Today, we're proud to offer a wide range of products, from electronics to home goods, 
                all backed by our commitment to quality and customer satisfaction.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Store sx={{ fontSize: 120 }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Features Section */}
        <Box mb={8}>
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
            Why Choose Us
          </Typography>
          <Grid container spacing={3} mt={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {React.cloneElement(feature.icon, { sx: { fontSize: 48 } })}
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box mb={8}>
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
            Meet Our Team
          </Typography>
          <Grid container spacing={3} mt={2}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission Section */}
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Our Mission
          </Typography>
          <Typography variant="h6" maxWidth="md" mx="auto">
            To provide exceptional online shopping experiences by offering quality products, 
            secure transactions, and outstanding customer service to communities across Kenya.
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default About;
