import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Display Component (Function Component)
 * Renders the error UI with translations
 */
const ErrorDisplay: React.FC<{
  error: Error | null;
  onReset: () => void;
}> = ({ error, onReset }) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <ErrorOutlineIcon
            color="error"
            sx={{ fontSize: 80, mb: 2 }}
            aria-hidden="true"
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {t('errorBoundary.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t('errorBoundary.description')}
          </Typography>
          {error && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left',
                overflow: 'auto',
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              >
                {error.toString()}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onReset}
            sx={{ mt: 3 }}
            aria-label={t('errorBoundary.tryAgainAria')}
          >
            {t('errorBoundary.tryAgain')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => window.location.reload()}
            sx={{ mt: 2, ml: 2 }}
            aria-label={t('errorBoundary.reloadPageAria')}
          >
            {t('errorBoundary.reloadPage')}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Note: Error boundaries must be class components in React
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorDisplay error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}
