import React from 'react';
import { connect } from 'react-redux';
import { setError } from '../../redux/reducers/error/error.actions';
import { setOriginApp } from '../../redux/reducers/origin/origin.actions';
import { closePlugin } from '../../rpc/calls/closePlugin';
import { getPlugin } from '../../rpc/calls/getPlugin';
import { VERUS_DESKTOP_AUTHENTICATOR } from '../../utils/constants';
import { 
  AddCoinRender
} from './addCoin.render';

class AddCoin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCoinParams: {
        chainTicker: null,
        mode: null,
        launchConfig: null
      }
    }

    this.getAddCoinParams = this.getAddCoinParams.bind(this)
    this.completeAuthorization = this.completeAuthorization.bind(this)
  }

  async componentDidUpdate(lastProps) {
    if (
      lastProps !== this.props &&
      ((lastProps.rpcPassword !== this.props.rpcPassword &&
        this.props.originAppId != null) ||
        (lastProps.originAppId !== this.props.originAppId &&
          this.props.rpcPassword != null))
    ) {
      try {
        this.props.dispatch(
          setOriginApp(
            await getPlugin(this.props.originAppId, this.props.originAppBuiltin)
          )
        );
      } catch (e) {
        this.props.dispatch(setError(e));
      }
    }
  }

  getAddCoinParams(addCoinParams, callback) {
    this.setState({addCoinParams}, () => {if (callback) callback()})
  }

  async completeAuthorization(authorized, error) {
    try {
      await closePlugin(VERUS_DESKTOP_AUTHENTICATOR, this.props.windowId, true, { authorized, error })
      console.log({authorized, error})
    } catch(e) {
      this.props.dispatch(setError(e))
    }
  } 

  render() {
    return AddCoinRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    pathArray: state.navigation.pathArray,
    port: state.rpc.port,
    originAppId: state.origin.originAppId,
    originApp: state.origin.originApp,
    originAppBuiltin: state.origin.originAppBuiltin,
    error: state.error.error,
    rpcPassword: state.rpc.password,
    windowId: state.rpc.windowId
  };
};

export default connect(mapStateToProps)(AddCoin);