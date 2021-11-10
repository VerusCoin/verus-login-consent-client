import React from 'react';
import { connect } from 'react-redux';
import { 
  RedirectRender
} from './Redirect.render';

class Redirect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.redirect = this.redirect.bind(this);
  }

  redirect() {
    this.setState({ loading: true }, () => {
      this.props.completeLoginConsent(this.props.requestResult)
    })
  }

  render() {
    return RedirectRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    loginConsentRequest: state.rpc.loginConsentRequest,
  };
};

export default connect(mapStateToProps)(Redirect);