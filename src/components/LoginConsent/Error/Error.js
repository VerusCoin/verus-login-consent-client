import { Button } from '@material-ui/core';
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
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>{"Error attempting to authorize coin."}</div>
        {this.props.error ? (
          <textarea
            className="error-textarea"
            rows="10"
            cols="80"
            value={this.props.error.stack}
          />
        ) : null}
        {this.props.completeAuthorization && (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{
              width: '98%'
            }}
            onClick={() => {
              this.props.completeAuthorization(false, this.props.error);
            }}
          >
            {"Close"}
          </Button>
        )}
      </div>
    );
  }
}

export default connect()(Error);
