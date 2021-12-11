import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiGrid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

const Grid = styled(MuiGrid)(({ theme }) => ({
  width: '100%',
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
    color: 'black'
  },
}));

export default function DividedText(props) {
  return (
    <Grid container>
      <Grid item xs style={{
        textAlign: "right",
        paddingRight: 64,
        maxWidth: 320
      }}>
        {props.left}
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs style={{
        textAlign: "left",
        paddingLeft: 64,
        maxWidth: 320
      }}>
        {props.right}
      </Grid>
    </Grid>
  );
}