import { Button } from "@material-ui/core";
import React from "react";
import { NATIVE } from '../../../utils/constants'

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
          {'Login to Bluesky@ through VerusID'}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1
          }}
        >
          {"VerusID Dropdown"}
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
              justifyContent: "space-between",
              width: 180
            }}
          >
            <a
              href="#"
            >
              {"Cancel"}
            </a>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={this.authorizeCoin}
              style={{
                width: 100
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

