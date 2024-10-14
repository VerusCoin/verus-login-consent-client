import Button from '@mui/material/Button';
import React from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const RedirectRender = function () {
  const { loading } = this.state

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          padding: 32,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{`Success!`}</div>
          <div style={{ margin: 16 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
          </div>
          {this.redirectinfo != null && (
            <div
              style={{ overflowWrap: "anywhere", maxWidth: 600 }}
            >{`Press 'done' to complete login ${this.extraInfo}`}
            </div>
          )}
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => this.redirect()}
              disabled={loading}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {"Done"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

