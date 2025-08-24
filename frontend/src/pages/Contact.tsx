import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { Email, Phone, LocationOn, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message sent successfully!');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: 'Email',
      value: 'support@sakifarm.com',
      description: 'Send us an email anytime',
    },
    {
      icon: <Phone />,
      title: 'Phone',
      value: '+254 700 000 000',
      description: 'Mon-Fri from 8am to 6pm',
    },
    {
      icon: <LocationOn />,
      title: 'Address',
      value: 'Nairobi, Kenya',
      description: 'Visit our office',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box mb={4}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Get in Touch
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Have questions? We're here to help. Reach out to us through any of the following channels.
              </Typography>
            </Box>

            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ color: 'primary.main' }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {info.title}
                        </Typography>
                        <Typography variant="body1" color="primary.main">
                          {info.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Send us a Message
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      disabled={loading}
                      sx={{ px: 4 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Box mt={6}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Visit Our Office
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              We're located in the heart of Nairobi. Feel free to visit us during business hours.
            </Typography>
            <Box
              sx={{
                height: 300,
                bgcolor: 'grey.100',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Interactive Map Coming Soon
              </Typography>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Contact;
