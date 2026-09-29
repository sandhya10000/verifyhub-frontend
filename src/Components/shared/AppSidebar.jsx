import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Collapse, Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import { ChevronsLeft, MoreVertical } from 'lucide-react';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import Logo from './Logo';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Shared dark-navy sidebar (admin + partner) matching new UI design.
 * Props: navGroups [{label?, items:[{text, icon, path?, badge?, children?[{text,icon,path}]}]}],
 * user {name, role}, collapsed, onToggleCollapse, activePath, onNavigate(path),
 * collapsibleState {open, onToggle} for grouped children, footerMenu [{label, danger?, onClick}]
 */
const AppSidebar = ({
  navGroups = [],
  user = {},
  collapsed = false,
  onToggleCollapse,
  activePath = '',
  onNavigate,
  collapsibleState,
  footerMenu = [],
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const isActive = (path) => path && activePath.startsWith(path);

  const renderItem = (item, depth = 0) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const childActive = hasChildren && item.children.some((c) => activePath === c.path || activePath.startsWith(c.path));
    const active = isActive(item.path) || childActive;
    const open = collapsibleState?.open && hasChildren ? collapsibleState.open : false;

    return (
      <React.Fragment key={item.text}>
        <ListItemButton
          onClick={() => {
            if (hasChildren && collapsibleState?.onToggle) {
              if (collapsed && onToggleCollapse) onToggleCollapse(false);
              collapsibleState.onToggle();
            } else if (item.path && onNavigate) onNavigate(item.path);
          }}
          title={collapsed ? item.text : ''}
          sx={{
            py: 1,
            px: collapsed ? 1 : 1.5,
            pl: collapsed ? 1 : 1.5 + depth * 1.5,
            mb: 0.5,
            borderRadius: 1,
            bgcolor: active ? '#2F7CF6' : 'transparent',
            color: active ? '#fff' : '#B9C3D4',
            justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': { bgcolor: active ? '#2F7CF6' : 'rgba(255,255,255,0.06)', color: '#fff' },
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 32, color: active ? '#fff' : '#8E9BB0', display: 'flex', justifyContent: 'center' }}>
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.text}
              slotProps={{ primary: {
                fontSize: '0.85rem', fontWeight: active ? 600 : 500,
                style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
              } }}
            />
          )}
          {!collapsed && item.badge != null && Number(item.badge) > 0 && (
            <Box sx={{ ml: 1, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.12)', color: '#B9C3D4', fontSize: '0.7rem', fontWeight: 700 }}>
              {Number(item.badge) > 99 ? '99+' : item.badge}
            </Box>
          )}
          {!collapsed && hasChildren && (open ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
        </ListItemButton>
        {hasChildren && !collapsed && (
          <Collapse in={!!open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 2 }}>
              {item.children.map((child) => {
                const cActive = activePath === child.path;
                return (
                  <ListItemButton
                    key={child.text}
                    onClick={() => onNavigate && onNavigate(child.path)}
                    sx={{
                      py: 0.8, px: 1.5, mb: 0.5, borderRadius: 1.5,
                      bgcolor: cActive ? '#2F7CF6' : 'transparent',
                      color: cActive ? '#fff' : '#B9C3D4',
                      '&:hover': { bgcolor: cActive ? '#2F7CF6' : 'rgba(255,255,255,0.06)', color: '#fff' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30, color: cActive ? '#fff' : '#8E9BB0' }}>{child.icon}</ListItemIcon>
                    <ListItemText primary={child.text} slotProps={{ primary: { fontSize: '0.82rem', fontWeight: cActive ? 600 : 400 } }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1B2A4A', borderRadius: 0, overflow: 'hidden' }}>
      {/* Logo row */}
      <Box sx={{ px: collapsed ? 1 : 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, minWidth: 0 }}>
            <Logo height={30} />
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap' }}>VerifyHub</Typography>
          </Box>
        )}
        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Logo height={30} />
          </Box>
        )}
        {!collapsed && onToggleCollapse && (
          <IconButton size="small" onClick={() => onToggleCollapse()} sx={{ color: '#8E9BB0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' } }}>
            <ChevronsLeft size={16} />
          </IconButton>
        )}
      </Box>

      {/* Nav groups */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5, py: 1,
        '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 } }}>
        {navGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.label && !collapsed && (
              <Typography sx={{ mt: gi === 0 ? 0.5 : 2, mb: 0.5, px: 1.5, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#67748E' }}>
                {group.label}
              </Typography>
            )}
            {group.label && collapsed && gi > 0 && <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />}
            <List sx={{ py: 0 }}>
              {(group.items || []).map((item) => renderItem(item))}
            </List>
          </React.Fragment>
        ))}
      </Box>

      {/* User card */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: collapsed ? 1 : 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#D6E4FF', color: '#2F7CF6', fontWeight: 700, fontSize: '0.8rem' }}>
          {getInitials(user.name || '')}
        </Avatar>
        {!collapsed && (
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#8E9BB0' }}>{user.role || ''}</Typography>
          </Box>
        )}
        {!collapsed && footerMenu.length > 0 && (
          <>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#8E9BB0' }}>
              <MoreVertical size={16} />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              {footerMenu.map((m) => (
                <MenuItem key={m.label} onClick={() => { setMenuAnchor(null); m.onClick && m.onClick(); }}
                  sx={{ fontSize: '0.85rem', color: m.danger ? 'error.main' : 'inherit' }}>
                  {m.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AppSidebar;
