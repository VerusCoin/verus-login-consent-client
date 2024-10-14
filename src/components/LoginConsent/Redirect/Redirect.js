import React from 'react';
import { connect } from 'react-redux';
import { 
  RedirectRender
} from './Redirect.render';
import { LOGIN_CONSENT_REDIRECT_VDXF_KEY, LOGIN_CONSENT_WEBHOOK_VDXF_KEY } from 'verus-typescript-primitives';

class Redirect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.redirect = this.redirect.bind(this);
    this.redirects = props.loginConsentRequest.request.challenge.redirect_uris;
    this.redirectinfo = this.redirects ? this.redirects[0] : null;
    this.extraInfo = '';

    if (this.redirectinfo.vdxfkey == LOGIN_CONSENT_REDIRECT_VDXF_KEY.vdxfid) {
      const url = new URL(this.redirectinfo.uri);
      this.extraInfo = ` and return to ${url.protocol}//${url.host}`
    }
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