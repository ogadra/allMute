import { makeStyles } from '@material-ui/core/styles';
import {useState, useEffect} from 'react';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import Header from '../components/header';
import React from 'react';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles({
    root: {
      '& > *': {
        flexGrow: 1,
        display: "block",
        textAlign: "center",
      },
      '& > * > *': {
        margin: "5% 5%",
      }
    },
    paper: {
      margin: 'auto',
      maxWidth: 500,
      background: '#FFF',
      padding: '30px',
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: 'auto',
      display: 'block',
      maxWidth: '100%',
      maxHeight: '100%',
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
})

export interface User{
  id_str: string;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
}

const AboutPage = () => {
  // @ts-ignore
  const classes = useStyles();
  // @ts-ignore
  const [data, setData] = useState<User>({id_str:"", name:"", screen_name:"", profile_image_url_https:""});

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // @ts-ignore
  useEffect(async () => {
    axios.get('./api/proxy/twitter').then((res) => {
      setData(res.data.user);
      console.log(res.data.user);
      })
  }, [])

  const callMethod = (method:string) => {
    const httpClient = axios.create();
    httpClient.post(`./api/proxy/twitter/${method}`).then((res) =>{
      if (res.data.status == "logouted"){
        location.href = "/";
      } else {
        handleOpen();
      }
    })
  }

  return (
  <div>
    <Header title="ツイッターを破壊"/>
    <div className={classes.root}>
    <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item>
            <ButtonBase className={classes.image}>
              <img className={classes.img} alt="complex" src={data.profile_image_url_https} />
            </ButtonBase>
          </Grid>
          <Grid item xs={12} container>
            <Grid item xs container direction="column" spacing={5}>
              <Grid item xs>
                <Typography gutterBottom variant="subtitle1">
                  {data.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {data.screen_name}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <div>
        <Button variant="contained" color="secondary" onClick={() => callMethod("mute/create")}>All Mute</Button>
        <Button variant="contained" onClick={() => callMethod("mute/destroy")}>All UnMute</Button>
        <Button variant="contained" color="primary" onClick={() => callMethod("unoauth")}>Log Out</Button>
      </div>
    </div>
    <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <h2 id="transition-modal-title">リクエストを受け付けました</h2>
            <p id="transition-modal-description">API制限により、実行に時間がかかることがあります。</p>
          </div>
        </Fade>
      </Modal>
  </div>
  )
}

export default AboutPage