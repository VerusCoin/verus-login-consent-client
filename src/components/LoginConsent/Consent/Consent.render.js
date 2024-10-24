import React from "react";
import Button from '@mui/material/Button';
import { RequestCard } from "../../../containers/RequestCard/RequestCard";

export const ConsentRender = function () {
  const { loading } = this.state
  const { loginConsentRequest } = this.props
  const { request } = loginConsentRequest
  const { sigBlockInfo, signedBy } = request
  const { time } = sigBlockInfo

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
          {this.displayName + "@"}{` is requesting login with VerusID`}
          </div>
        </div>
        <RequestCard
          chainId={request.chain_id}
          signedBy={signedBy}
          displayName={this.displayName}
          time={time}
        >
        </RequestCard>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        > 
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
              disabled={loading}
              onClick={() => this.tryLogin()}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {"Agree"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

