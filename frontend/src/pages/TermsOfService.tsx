import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { Gavel } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={6}>
          <Gavel sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Terms of Service
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using SakiFarm's website and services, you accept and agree to be bound 
            by the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily download one copy of the materials on SakiFarm's 
            website for personal, non-commercial transitory viewing only. This is the grant of a 
            license, not a transfer of title, and under this license you may not:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Account Terms
          </Typography>
          <Typography variant="body1" paragraph>
            When you create an account with us, you must provide information that is accurate, 
            complete, and current at all times. You are responsible for safeguarding the password 
            and for all activities that occur under your account.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Orders and Payment
          </Typography>
          <Typography variant="body1" paragraph>
            All orders are subject to availability and confirmation of the order price. We reserve 
            the right to refuse any order you place with us. Payment must be received by us before 
            the dispatch of goods.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Shipping and Returns
          </Typography>
          <Typography variant="body1" paragraph>
            We will arrange for shipping of the product to you. Risk of loss and title for items 
            purchased pass to you upon delivery. We offer a 30-day return policy for unused items 
            in original packaging.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Prohibited Uses
          </Typography>
          <Typography variant="body1" paragraph>
            You may not use our service:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no case shall SakiFarm, our directors, officers, employees, affiliates, agents, 
            contractors, interns, suppliers, service providers, or licensors be liable for any 
            injury, loss, claim, or any direct, indirect, incidental, punitive, special, or 
            consequential damages of any kind.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            Questions about the Terms of Service should be sent to us at:
          </Typography>
          <Typography variant="body1">
            Email: legal@sakifarm.com<br />
            Phone: +254 700 000 000<br />
            Address: Nairobi, Kenya
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default TermsOfService;
