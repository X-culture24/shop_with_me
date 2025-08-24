import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  MoreHoriz,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  size?: 'small' | 'medium' | 'large';
}

const ModernPagination: React.FC<ModernPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 7,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Add ellipsis if there's a gap after first page
      if (startPage > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap before last page
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const PageButton = ({ page, isActive }: { page: number; isActive: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        onClick={() => onPageChange(page)}
        sx={{
          minWidth: buttonSize,
          height: buttonSize,
          borderRadius: '12px',
          mx: 0.5,
          fontWeight: 600,
          fontSize: size === 'small' ? '0.875rem' : '1rem',
          background: isActive
            ? 'linear-gradient(135deg, #FF1493 0%, #000080 100%)'
            : 'transparent',
          color: isActive ? 'white' : theme.palette.text.primary,
          border: `2px solid ${
            isActive ? 'transparent' : alpha(theme.palette.primary.main, 0.2)
          }`,
          '&:hover': {
            background: isActive
              ? 'linear-gradient(135deg, #FF1493 0%, #000080 100%)'
              : alpha(theme.palette.primary.main, 0.1),
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {page}
      </Button>
    </motion.div>
  );

  const NavButton = ({
    onClick,
    disabled,
    icon,
    label,
  }: {
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    label: string;
  }) => (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.1 }}
    >
      <IconButton
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        sx={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '12px',
          mx: 0.5,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          color: disabled ? theme.palette.text.disabled : theme.palette.primary.main,
          '&:hover': !disabled
            ? {
                background: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            : {},
          '&:disabled': {
            borderColor: alpha(theme.palette.text.disabled, 0.2),
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Box component="span" sx={{ fontSize: iconSize }}>
          {icon}
        </Box>
      </IconButton>
    </motion.div>
  );

  if (totalPages <= 1) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1}
      py={2}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        px: 3,
      }}
    >
      {/* First Page */}
      {showFirstLast && (
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          icon={<FirstPage />}
          label="First page"
        />
      )}

      {/* Previous Page */}
      <NavButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        icon={<ChevronLeft />}
        label="Previous page"
      />

      {/* Page Numbers */}
      <Box display="flex" alignItems="center" mx={1}>
        {getVisiblePages().map((page, index) =>
          page === 'ellipsis' ? (
            <Box
              key={`ellipsis-${index}`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                width: buttonSize,
                height: buttonSize,
                mx: 0.5,
              }}
            >
              <MoreHoriz color="disabled" />
            </Box>
          ) : (
            <PageButton
              key={page}
              page={page as number}
              isActive={page === currentPage}
            />
          )
        )}
      </Box>

      {/* Next Page */}
      <NavButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        icon={<ChevronRight />}
        label="Next page"
      />

      {/* Last Page */}
      {showFirstLast && (
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          icon={<LastPage />}
          label="Last page"
        />
      )}

      {/* Page Info */}
      <Box ml={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          }}
        >
          {currentPage} of {totalPages}
        </Typography>
      </Box>
    </Box>
  );
};

export default ModernPagination;
