import { MenuItem, ListSubheader } from '@mui/material';
import { INDIAN_STATES, INDIAN_UNION_TERRITORIES } from '../../constants/indianStates';

// Shared menu items for every state dropdown (MUI `TextField select`).
// IMPORTANT: this must stay a FLAT ELEMENT ARRAY, not a wrapper component —
// MUI Select resolves the selected display text only from direct MenuItem
// children, so <StateMenuItems /> as a component leaves the field blank.
// Usage: <TextField select name="state" value={...} onChange={...}>{stateMenuItems}</TextField>
// Values are exact state names, so existing string validations keep working.
export const stateMenuItems = [
  <MenuItem key="placeholder" value="" disabled>
    Select state
  </MenuItem>,
  <ListSubheader key="subheader-states">States</ListSubheader>,
  ...INDIAN_STATES.map((s) => (
    <MenuItem key={s} value={s}>
      {s}
    </MenuItem>
  )),
  <ListSubheader key="subheader-uts">Union Territories</ListSubheader>,
  ...INDIAN_UNION_TERRITORIES.map((s) => (
    <MenuItem key={s} value={s}>
      {s}
    </MenuItem>
  )),
];
