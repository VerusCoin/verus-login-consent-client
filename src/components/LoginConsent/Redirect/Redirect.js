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
    this.redirects = props.loginConsentRequest.request.challenge.client.redirect_uris;
    this.redirectinfo = this.redirects ? this.redirects[0] : null;
  }

  redirect() {
    this.setState({ loading: true }, () => {
      this.props.completeLoginConsent({
        response: this.props.requestResult.response,
        redirect: this.redirectinfo,
      });
    });
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