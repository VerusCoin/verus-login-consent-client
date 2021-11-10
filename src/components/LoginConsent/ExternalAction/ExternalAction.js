import React from 'react';
import { connect } from 'react-redux';
import { setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  ExternalActionRender
} from './ExternalAction.render';
import { EXTERNAL_ACTION, EXTERNAL_CHAIN_START, SELECT_LOGIN_ID } from '../../../utils/constants'
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
        desc: `You need to launch ${this.props.loginConsentRequest.chain} in native mode and be fully synced to the blockchain in order to login with VerusID. When you are, press 'continue'.`,
        check: async () => {
          const userActions = await checkAndUpdateAll(this.props.loginConsentRequest.chain)
          userActions.map(action => props.dispatch(action))

          return userActions.some((x) => x.type === SET_API_ERROR)
            ? EXTERNAL_ACTION
            : SELECT_LOGIN_ID;
        }
      })
    }
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
        this.props.dispatch(setNavigationPath(await ((this.actionTypes[this.props.externalAction])()).check()))

        this.setState({ loading: false })
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
    externalAction: state.navigation.externalAction
  };
};

export default connect(mapStateToProps)(ExternalAction);