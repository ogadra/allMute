import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';

// interface Props {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */

// }

type Props = {
    title: string;
    window?: () => Window;
    children?: React.ReactElement;
}


export default function Header(props: Props) {
  return (
    <div>
    <title>{props.title}</title>
    <link rel="icon" href="/favicon.ico" />
      <CssBaseline />
        <AppBar>
          <Toolbar>
            <Typography variant="h6">{props.title}</Typography>
          </Toolbar>
        </AppBar>
      <Toolbar/>
      <br/>
    </div>
  );
}
