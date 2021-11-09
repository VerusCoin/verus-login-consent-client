import Button from '@mui/material/Button';
import React from "react";

export const ExternalActionRender = function () {
  const { loading } = this.state

  return (
    <div
      style={{
        height: '100%',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {this.actionTypes[this.props.externalAction].desc}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 48,
          width: '100%'
        }}
      >
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={this.openVerusDesktop}
          style={{
            width: 240
          }}
        >
          {"Open Verus Desktop"}
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={this.tryUser}
          style={{
            width: 240
          }}
        >
          {"Continue"}
        </Button>
      </div>
    </div>
  );
};

