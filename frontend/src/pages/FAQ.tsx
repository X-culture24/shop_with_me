import React, { useState } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { ExpandMore, Search, Help } from '@mui/icons-material';
import { motion } from 'framer-motion';

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'orders', label: 'Orders' },
    { id: 'payments', label: 'Payments' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'returns', label: 'Returns' },
    { id: 'account', label: 'Account' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You\'ll need to create an account or sign in, provide shipping information, and complete payment.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. After that, please contact our customer service team for assistance.'
    },
    {
      id: 3,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Airtel Money, and major credit/debit cards. All payments are processed securely through our encrypted payment gateway.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete card details on our servers.'
    },
    {
      id: 5,
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days within Kenya. Express shipping is available for 1-2 business days delivery.'
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Do you offer free shipping?',
      answer: 'Yes, we offer free standard shipping on orders over KSh 2,000. Express shipping charges apply regardless of order value.'
    },
    {
      id: 7,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original packaging. Return shipping costs are covered by us for defective items.'
    },
    {
      id: 8,
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To return an item, go to your order history, select the item you want to return, and follow the return process. We\'ll provide a return label.'
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click on "Register" in the top menu, fill in your details, and verify your email or phone number with the OTP we send you.'
    },
    {
      id: 10,
      category: 'account',
      question: 'I forgot my password. What should I do?',
      answer: 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions to reset your password using OTP verification.'
    },
    {
      id: 11,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order in the "My Orders" section of your account.'
    },
    {
      id: 12,
      category: 'payments',
      question: 'Can I pay with M-Pesa?',
      answer: 'Yes, M-Pesa is one of our primary payment methods. Simply select M-Pesa at checkout and follow the prompts to complete your payment.'
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={6}>
          <Help sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Find answers to common questions about our service
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Categories */}
        <Box mb={4} display="flex" gap={1} flexWrap="wrap" justifyContent="center">
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              onClick={() => setSelectedCategory(category.id)}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* FAQs */}
        <Box>
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight="medium">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>

        {filteredFAQs.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No FAQs found matching your search.
            </Typography>
          </Box>
        )}

        <Box mt={6} textAlign="center">
          <Typography variant="h6" gutterBottom>
            Still have questions?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Contact our customer support team at support@sakifarm.com or call +254 700 000 000
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
};

export default FAQ;
