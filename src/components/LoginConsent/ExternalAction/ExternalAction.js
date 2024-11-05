import React from 'react';
import { connect } from 'react-redux';
import { setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  ExternalActionRender
} from './ExternalAction.render';
import { CONSENT_TO_SCOPE, EXTERNAL_ACTION, EXTERNAL_CHAIN_START, SELECT_LOGIN_ID } from '../../../utils/constants'
import { checkAndUpdateAll } from '../../../redux/reducers/identity/identity.actions';
import { focusVerusDesktop } from '../../../rpc/calls/focus';
import { SET_API_ERROR } from '../../../redux/reducers/error/error.types';

class ExternalAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.tryContinue = this.tryContinue.bind(this);
    this.openVerusDesktop = this.openVerusDesktop.bind(this)

    this.actionTypes = {
      [EXTERNAL_CHAIN_START]: () => ({
        desc: `You need to launch ${this.props.loginConsentRequest.request.chainTicker} in native mode and be fully synced to the blockchain in order to login with VerusID. When you are, press 'continue'.`,
        check: async () => {
          const userActions = await checkAndUpdateAll(this.props.loginConsentRequest.request.chainTicker);
          userActions.map((action) => props.dispatch(action));

          return userActions.some((x) => x.type === SET_API_ERROR)
            ? EXTERNAL_ACTION
            : SELECT_LOGIN_ID;
        },
      }),
      [EXTERNAL_CHAIN_START]: () => ({
        desc: `Launch ${this.props.loginConsentRequest.request.chainTicker} in native mode, and ensure that you have at least one identity that you're able to sign with to login with VerusID. Then press 'continue'.`,
        check: async () => {
          // Process the request again if any of the required daemons were not running when first trying.
          await this.props.handleRequest();

          if (this.props.identities.length > 0) {
            return CONSENT_TO_SCOPE
          }

          return EXTERNAL_ACTION;
        },
      }),
    };
  }

  openVerusDesktop() {
    this.setState({ loading: true }, async () => {
      try {
        await focusVerusDesktop()
      } catch(e) {}
      
      this.setState({ loading: false })
    })
  }

  tryContinue() {
    this.setState({ loading: true }, async () => {
      if (this.actionTypes[this.props.externalAction]) {  
        this.setState({ loading: false })
        this.props.dispatch(setNavigationPath(await ((this.actionTypes[this.props.externalAction])()).check()))
      }
    })
  }

  cancel() {
    this.setState({ loading: true }, async () => {
      await this.props.completeLoginConsent()
    })
  }

  render() {
    return ExternalActionRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    loginConsentRequest: state.rpc.loginConsentRequest,
    externalAction: state.navigation.externalAction,
    identities: state.identity.identities
  };
};

export default connect(mapStateToProps)(ExternalAction);