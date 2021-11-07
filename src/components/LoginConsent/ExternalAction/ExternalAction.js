import React from 'react';
import { connect } from 'react-redux';
import { setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  ExternalActionRender
} from './ExternalAction.render';
import { CONFIGURE, EXTERNAL_LOGIN, EXTERNAL_ZCASHPARAMS, NATIVE } from '../../../utils/constants'
import { checkAndUpdateUsers } from '../../../redux/reducers/user/user.actions';
import { checkZcashParamsFormatted } from '../../../rpc/calls/zcashParams';
import { focusVerusDesktop } from '../../../rpc/calls/focus';

class ExternalAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.tryUser = this.tryUser.bind(this);
    this.openVerusDesktop = this.openVerusDesktop.bind(this)

    this.actionTypes = {
      [EXTERNAL_LOGIN]: {
        desc: 'You need to be logged into a Verus Desktop profile to connect to a coin. Select a profile within Verus Desktop and press "Continue".',
        check: async () => {
          const userActions = await checkAndUpdateUsers()
          userActions.map(action => props.dispatch(action))

          return userActions[0].payload.id
        }
      },
      [EXTERNAL_ZCASHPARAMS]: {
        desc: 'In order to connect a coin in native mode, you need ZCash Parameters. To download them, start any native mode coin in Verus Desktop, and press "Continue."',
        check: async () => {
          const zcashParamsErrors = await checkZcashParamsFormatted()

          if (zcashParamsErrors.msg === 'success') {
            const zcpmsRes = zcashParamsErrors.result
            
            if (zcpmsRes.length > 0) {
              return false
            } else {
              return true
            }
          } else {
            return false
          }
        }
      }
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

  async tryUser() {
    this.setState({ loading: true }, async () => {
      if (this.actionTypes[this.props.externalAction]) {  
        if (await this.actionTypes[this.props.externalAction].check()) {
          this.props.dispatch(setNavigationPath(`${CONFIGURE}_${this.props.loginConsentRequest.mode === NATIVE ? 'NATIVE' : 'LITE'}`));
        } else {
          this.setState({ loading: false })
        }
      }
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
    activeUserId: state.user.activeUserId,
    externalAction: state.navigation.externalAction
  };
};

export default connect(mapStateToProps)(ExternalAction);