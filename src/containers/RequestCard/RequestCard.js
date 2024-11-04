import React from 'react';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { unixToDate } from '../../utils/math';

// RequestIdentityItem is a list item for displaying the identity in 
// the dropdown section of the request.
function RequestIdentityItem({field, value}) {
  return (
    <ListItem divider sx={{pl:4, pr:4}}>
      <ListItemText primary={field} disableTypography/>
      <ListItemText
        primary={value}
        disableTypography
        sx={{textAlign:'right', color: "#878787"}}
      />
    </ListItem>
  )
}

export function RequestCard(props) {
  const chainName = props.chainName
  const systemId = props.systemId
  const revocationIdentity = props.revocationIdentity
  const recoveryIdentity = props.recoveryIdentity
  const signedBy = props.signedBy
  const displayName = props.displayName
  const time = props.time
  const permissions = props.permissions
  const height = props.height

  const requestedByDescriptor = `${displayName}@ (${signedBy.identity.identityaddress})`
  const systemIdentityDescriptor = `${chainName} (${systemId})`
  const revocationIdentityDescriptor = `${revocationIdentity.friendlyname} (${revocationIdentity.identity.identityaddress})`
  const recoveryIdentityDescriptor = `${recoveryIdentity.friendlyname} (${recoveryIdentity.identity.identityaddress})`

  const [openIdentity, setOpenIdentity] = React.useState(false);

  const handleIdentityClick = () => {
    setOpenIdentity(!openIdentity);
  };

  return (
    <Card square sx={{
        marginTop:1,
        marginBottom:1,
        width: '100%',
        overflowY: 'scroll',
        maxHeight: height,
      }}> 
      <List>
        <ListItemButton divider onClick={handleIdentityClick}>
          <ListItemText primary="Requested by" disableTypography sx={{ fontWeight: 'bold', pr:4}}/>
          <ListItemText primary={requestedByDescriptor} disableTypography sx={{textAlign:'right'}}/>
          {openIdentity ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openIdentity} timeout="auto" unmountOnExit>
          <List component="div" dense disablePadding>
            <RequestIdentityItem
              field={"Name"}
              value={signedBy.identity.name}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"Identity Address"}
              value={signedBy.identity.identityaddress}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"Status"}
              value={signedBy.status}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"Revocation Authority"}
              value={revocationIdentityDescriptor}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"Recovery Authority"}
              value={recoveryIdentityDescriptor}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"System"}
              value={systemIdentityDescriptor}
            >
            </RequestIdentityItem>
            <RequestIdentityItem
              field={"Primary Address #1"}
              value={signedBy.identity.primaryaddresses[0]}
            >
            </RequestIdentityItem>
          </List>
        </Collapse>

        <ListItem divider>
          <ListItemText primary="Permissions requested" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
          <ListItemText primary={permissions} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>

        <ListItem divider>
          <ListItemText primary="System name" disableTypography sx={{ fontWeight: 'bold', pr:4}}/>
          <ListItemText primary={systemIdentityDescriptor} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>

        <ListItem>
          <ListItemText primary="Signed on" disableTypography sx={{ fontWeight: 'bold', pr:4}}/>
          <ListItemText primary={unixToDate(time)} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>
      </List>
    </Card> 
  )
}