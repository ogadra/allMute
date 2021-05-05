import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import {useState, useEffect} from 'react';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      padding: theme.spacing(2),
      margin: 'auto',
      maxWidth: 500,
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
  }),
);

interface User{
  id_str: string;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
}

const AboutPage = () => {
  const classes = useStyles();
  const [data, setData] = useState<User>(false);

  useEffect(async () => {
    console.log(49);
    axios.get('./api/proxy/twitter').then((res) => {
      console.log(res);
      setData(res.data.user);
      })
  }, [])

  const allMute = () => {
    const httpClient = axios.create();
    httpClient.defaults.timeout = 7200000;
    httpClient.post('./api/proxy/twitter/allMute').then((res) =>{
      console.log(res);
    })
  }
  const allUnMute = () => {
    axios.post('./api/proxy/twitter/allUnMute').then((res) =>{
      console.log(res);
    })
  }

  return (
  <div className={classes.root}>
    <title>ツイッターを破壊</title>
    <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item>
            <ButtonBase className={classes.image}>
              <img className={classes.img} alt="complex" src={data.profile_image_url_https} />
            </ButtonBase>
          </Grid>
          <Grid item xs={3} container>
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
      <div >
        <Button variant="contained" color="secondary" onClick={allMute}>All Mute</Button>
        <Button variant="contained" onClick={allUnMute}>All UnMute</Button>
      </div>
  </div>
  )
}

export default AboutPage