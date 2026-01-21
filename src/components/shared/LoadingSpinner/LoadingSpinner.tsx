import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

/**
 * Loading Spinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 40,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress size={size} aria-label="Loading" />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
