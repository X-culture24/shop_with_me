import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={6}>
          <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Privacy Policy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account, 
            make a purchase, or contact us for support. This includes your name, email address, 
            phone number, shipping address, and payment information.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send promotional emails (with your consent)</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy. We may share your information with:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Service providers who help us operate our business</li>
            <li>Payment processors to handle transactions</li>
            <li>Shipping companies to deliver your orders</li>
            <li>Law enforcement when required by law</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption 
            for data transmission and secure storage of sensitive information.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and personal data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at:
          </Typography>
          <Typography variant="body1">
            Email: privacy@sakifarm.com<br />
            Phone: +254 700 000 000<br />
            Address: Nairobi, Kenya
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PrivacyPolicy;
