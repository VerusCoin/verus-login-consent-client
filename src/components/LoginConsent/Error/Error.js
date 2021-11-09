import Button from '@mui/material/Button';
import React from 'react';
import { connect } from 'react-redux';
import { setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { AUTHORIZE_COIN } from '../../../utils/constants';

class Error extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
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
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1
            }}
          >
            <div style={{ fontWeight: "bold" }}>{"Error! Something went wrong."}</div>
            {this.props.error ? (
              <textarea
                className="error-textarea"
                rows="10"
                cols="60"
                value={this.props.error.stack}
                style={{
                  marginTop: 32
                }}
              />
            ) : null}
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
                type="submit"
                variant="contained"
                color="secondary"
                style={{
                  width: 120,
                  padding: 8
                }}
              >
                {"Close"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(Error);
