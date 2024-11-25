import React, { useState }  from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { VerusIdLogo } from "../../../../images";

export const ProvisionIdentityFormRender = function () {
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
          alignItems: "center",
        }}
      >
        <img src={VerusIdLogo} width={'55%'} height={'10%'}/>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              padding: 8,
            }}
          >
            {`Request VerusID`}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            paddingTop: 2,
          }}
        >
          <TextField
            label="i-Address or VerusID name"
            sx={{
              maxWidth: 560,
              flex: 1,
              width: "100%",
              m: 1
            }}
            variant="outlined"
            value={this.state.assignedIdentity}
            mode="outlined"
            disabled={this.state.assignedIdentity != null || loading}
            onChange={event => {
              const text = event.target.value
              console.log("text", text);
              if (this.state.assignedIdentity == null && !text.endsWith("@")) {
                this.setState({
                  assignedIdentity: text
                });
              }
            }}
          >
          </TextField>
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
              variant="text"
              disabled={loading}
              color="secondary"
              onClick={() => this.cancel()}
              style={{
                width: 120,
                marginRight: 32,
                padding: 8,
              }}
            >
              {"Back"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={() => this.submitData()}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {"Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};