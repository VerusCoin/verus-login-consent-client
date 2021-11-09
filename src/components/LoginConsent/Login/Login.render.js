import React from "react";
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export const LoginRender = function () {
  const { loading } = this.state
  const { loginConsentRequest, originApp } = this.props
  const { chain, mode } = loginConsentRequest

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      height: '100%'
    }}>
      <div style={{
        height: '100%',
        display: 'flex',
        padding: 32,
        flexDirection: 'column'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: "center",
            flexDirection: 'row'
          }}>
            {'Login to'}&nbsp;
            <a href="#">{'Bluesky@'}</a>
            &nbsp;{"with VerusID"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1
          }}
        >
        <FormControl style={{ maxWidth: 560, flex: 1 }}>
          <Select
            value={""}
            displayEmpty
            inputProps={{ 'aria-label': 'Select a VerusID' }}
            style={{
              textAlign: "start",
              paddingTop: 2
            }}
          >
            <MenuItem value="">
              <em>Select a VerusID</em>
            </MenuItem>
            <MenuItem value={10}>Michael@</MenuItem>
            <MenuItem value={20}>ID@</MenuItem>
            <MenuItem value={30}>😋@</MenuItem>
          </Select>
        </FormControl>
        </div>
        <div style={{
          width: '100%',
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "flex-end"
        }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Button
              variant="text"
              disabled={loading}
              color="secondary"
              style={{
                width: 120,
                marginRight: 32,
                padding: 8
              }}
            >
              {"Cancel"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              style={{
                width: 120,
                padding: 8
              }}
            >
              {"Login"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

