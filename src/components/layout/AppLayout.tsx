import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

const drawerWidth = 240;

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * App Layout Component
 * Provides navigation, header, and responsive drawer
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: '/', label: t('nav.dashboard'), icon: <DashboardIcon /> },
    { path: '/members', label: t('nav.members'), icon: <PeopleIcon /> },
    { path: '/teams', label: t('nav.teams'), icon: <GroupIcon /> },
    { path: '/statistics', label: t('nav.statistics'), icon: <BarChartIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDarkModeToggle = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value as 'en' | 'de';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
    i18n.changeLanguage(newLang);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          {t('app.title')}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-label={item.label}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('settings.title')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={state.darkMode}
              onChange={handleDarkModeToggle}
              icon={<Brightness7Icon />}
              checkedIcon={<Brightness4Icon />}
              inputProps={{ 'aria-label': t('accessibility.toggleDarkMode') }}
            />
          }
          label={t('settings.darkMode')}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" display="block" gutterBottom>
            {t('settings.language')}
          </Typography>
          <Select
            value={state.language}
            onChange={handleLanguageChange}
            size="small"
            fullWidth
            inputProps={{ 'aria-label': t('accessibility.changeLanguage') }}
          >
            <MenuItem value="en">{t('settings.english')}</MenuItem>
            <MenuItem value="de">{t('settings.german')}</MenuItem>
          </Select>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={t('accessibility.openMenu')}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navItems.find((item) => item.path === location.pathname)?.label || t('app.title')}
          </Typography>
          <IconButton
            onClick={handleDarkModeToggle}
            color="inherit"
            aria-label={t('accessibility.toggleDarkMode')}
          >
            {state.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
