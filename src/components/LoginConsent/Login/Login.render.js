import React from "react";
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { VerusIdLogo } from "../../../images";

export const LoginRender = function () {
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
            {`Select an Identity` +
              (this.canProvision ? " or Request an Identity" : "")}
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
          <FormControl style={{ maxWidth: 560, flex: 1 }}>
            <Select
              value={
                this.props.activeIdentity == null
                  ? ""
                  : this.props.activeIdentity.identity.identityaddress
              }
              displayEmpty
              inputProps={{ "aria-label": "Select a VerusID" }}
              style={{
                textAlign: "start",
                paddingTop: 2,
              }}
              onChange={(e) => {
                return this.selectId(e.target.value);
              }}
            >
              <MenuItem value="">
                <em>Select a VerusID</em>
              </MenuItem>
              {this.props.identities.map((id, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={id.identity.identityaddress}
                  >{`${id.identity.name}@`}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
        <div
           style={{
            width: "100%",
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          {this.canProvision && <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={() => this.tryProvision()}
            style={{
              width: 240,
              padding: 8,
            }}
          >
            {"Request a new VerusID"}
          </Button>}
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
              disabled={loading || this.props.activeIdentity == null}
              onClick={() => this.tryLogin()}
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

