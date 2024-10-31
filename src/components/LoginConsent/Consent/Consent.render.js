import React from "react";
import Button from '@mui/material/Button';
import { RequestCard } from "../../../containers/RequestCard/RequestCard";
import { VerusIdLogo } from "../../../images";

export const ConsentRender = function () {
  const { loading } = this.state
  const { loginConsentRequest } = this.props
  const { request } = loginConsentRequest
  const { sigBlockInfo, signedBy, signingRevocationIdentity, signingRecoveryIdentity } = request
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
          alignItems: "center",
        }}
      >
        <img src={VerusIdLogo} width={'55%'} height={'10%'}/>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: 8,
            justifyContent: "center",
          }}
        >
          {this.displayName + "@"}{` is requesting login with VerusID`}
        </div>

          <RequestCard
            chainName={request.chainName}
            systemId={request.system_id}
            signedBy={signedBy}
            revocationIdentity={signingRevocationIdentity}
            recoveryIdentity={signingRecoveryIdentity}
            displayName={this.displayName}
            time={time}
            permissions={this.permissionsText}
            height={"54vh"}
          >
          </RequestCard>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "auto",
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

