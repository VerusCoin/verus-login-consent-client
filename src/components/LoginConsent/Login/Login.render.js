import React from "react";
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export const LoginRender = function () {
  const { loading } = this.state
  const { loginConsentRequest } = this.props
  const { chain, signingId, onBehalfOf } = loginConsentRequest

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
        }}
      >
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
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            {"Login to"}&nbsp;
            <a href="#">{signingId}</a>
            &nbsp;{`with VerusID${onBehalfOf != null ? ` (on behalf of ${onBehalfOf})` : ""} on ${chain}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <FormControl style={{ maxWidth: 560, flex: 1 }}>
            <Select
              value={
                this.props.activeIdentity == null ? "" : this.props.activeIdentity.identity.address
              }
              displayEmpty
              inputProps={{ "aria-label": "Select a VerusID" }}
              style={{
                textAlign: "start",
                paddingTop: 2,
              }}
            >
              <MenuItem value="">
                <em>Select a VerusID</em>
              </MenuItem>
              {this.props.identities.map((id) => {
                <MenuItem value={id.identity.address}>{`${id.identity.name}@`}</MenuItem>;
              })}
            </Select>
          </FormControl>
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
              {"Cancel"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={loading || this.props.activeIdentity == null}
              onClick={() => this.tryLogin()}
              style={{
                width: 120,
                padding: 8,
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

