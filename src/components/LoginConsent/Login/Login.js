import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  LoginRender
} from './Login.render';
import { CONFIGURE, EXTERNAL_ACTION, EXTERNAL_LOGIN, NATIVE } from '../../../utils/constants'
import { checkAndUpdateUsers } from '../../../redux/reducers/user/user.actions';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.authorizeCoin = this.authorizeCoin.bind(this);
  }

  authorizeCoin() {
    this.setState({ loading: true }, async () => {
      const userActions = await checkAndUpdateUsers()
      userActions.map(action => this.props.dispatch(action))

      if (this.props.activeUserId) {
        // this.props.setLoginConsentParams(this.props.loginConsentRequest, () => {
        //   this.props.dispatch(
        //     setNavigationPath(`${CONFIGURE}_${this.props.loginConsentRequest.mode === NATIVE ? 'NATIVE' : 'LITE'}`)
        //   );
        // });
      } else {
        this.props.setLoginConsentParams(this.props.loginConsentRequest, () => {
          this.props.dispatch(setExternalAction(EXTERNAL_LOGIN))
          this.props.dispatch(
            setNavigationPath(EXTERNAL_ACTION)
          );
        });
      }
    })
  }

  render() {
    return LoginRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    loginConsentRequest: state.rpc.loginConsentRequest,
    activeUserId: state.user.activeUserId,
    originApp: state.origin.originApp
  };
};

export default connect(mapStateToProps)(Login);