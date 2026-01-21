import React, { type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  icon?: ReactNode;
}

/**
 * Empty State Component
 * Displays when there's no data to show
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <InboxIcon sx={{ fontSize: 80 }} />,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 2 }} aria-hidden="true">
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          startIcon={action.icon}
          sx={{ mt: 2 }}
          aria-label={action.label}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};
