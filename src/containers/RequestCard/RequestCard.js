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

export function RequestCard(props) {
  const chainId = props.chainId
  const signedBy = props.signedBy
  const displayName = props.displayName
  const time = props.time
  const permissions = props.permissions
  const height = props.height

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
          <ListItemText primary="Requested by" disableTypography sx={{ fontWeight: 'bold' }}/>
          <ListItemText primary={displayName + "@"} disableTypography sx={{textAlign:'right'}}/>
          {openIdentity ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openIdentity} timeout="auto" unmountOnExit>
          <List component="div" dense disablePadding>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Name" disableTypography/>
              <ListItemText
                primary={displayName}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Identity Address" disableTypography/>
              <ListItemText 
                primary={signedBy.identity.identityaddress}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Status" disableTypography/>
              <ListItemText
                primary={signedBy.status}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Revocation Authority" disableTypography/>
              <ListItemText 
                primary={signedBy.identity.revocationauthority}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Recovery Authority" disableTypography/>
              <ListItemText 
                primary={signedBy.identity.recoveryauthority}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="System" disableTypography/>
              <ListItemText
                primary={chainId} 
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
            <ListItem divider sx={{pl:4}}>
              <ListItemText primary="Primary Address #1" disableTypography/>
              <ListItemText
                primary={signedBy.identity.primaryaddresses[0]}
                disableTypography
                sx={{textAlign:'right', color: "#878787"}}
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem divider>
          <ListItemText primary="Permissions requested" disableTypography sx={{ fontWeight: 'bold' }}/>
          <ListItemText primary={permissions} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>

        <ListItem divider>
          <ListItemText primary="System name" disableTypography sx={{ fontWeight: 'bold' }}/>
          <ListItemText primary={chainId} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>

        <ListItem>
          <ListItemText primary="Signed on" disableTypography sx={{ fontWeight: 'bold' }}/>
          <ListItemText primary={unixToDate(time)} disableTypography sx={{textAlign:'right'}}/>
        </ListItem>
      </List>
    </Card> 
  )
}