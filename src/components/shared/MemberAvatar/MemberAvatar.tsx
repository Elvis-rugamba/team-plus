import React, { useState } from 'react';
import { Avatar, Popover } from '@mui/material';
import type { MemberWithNames } from '@/hooks/useMembers';
import { MemberDetailsCard } from '../MemberDetailsCard';

interface MemberAvatarProps {
  member: MemberWithNames;
  teamCount?: number;
  size?: 'small' | 'medium' | 'large';
  bgcolor?: string;
}

/**
 * Member Avatar with Hover Details
 * Shows member details card on hover
 */
export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  teamCount,
  size = 'medium',
  bgcolor,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 28, height: 28, fontSize: '0.75rem' };
      case 'large':
        return { width: 48, height: 48, fontSize: '1.25rem' };
      case 'medium':
      default:
        return { width: 32, height: 32, fontSize: '0.875rem' };
    }
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Avatar
        sx={{
          ...getSizeStyles(),
          bgcolor: bgcolor || 'primary.main',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 2,
          },
        }}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        aria-label={`${member.name} - ${member.roleName}`}
      >
        {getInitials(member.name)}
      </Avatar>
      <Popover
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: { mt: 1 },
          },
        }}
      >
        <MemberDetailsCard member={member} teamCount={teamCount} />
      </Popover>
    </>
  );
};
