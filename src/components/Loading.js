/**
 * This container shows a loading animation while the plugin is waiting on 
 * an initialization ipc call 
 */

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

class Loading extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }
}

export default Loading