import { makeStyles } from '@material-ui/core/styles';
import {useState, useEffect} from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import Header from '../components/header';

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

  // @ts-ignore
  useEffect(async () => {
    console.log(49);
    axios.get('./api/proxy/twitter').then((res) => {
      console.log(res);
      setData(res.data.user);
      })
  }, [])

  const callMethod = (method:string) => {
    const httpClient = axios.create();
    httpClient.post(`./api/proxy/twitter/mute/${method}`).then((res) =>{
      console.log(res);
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
      <div>
        <Button variant="contained" color="secondary" onClick={() => callMethod("create")}>All Mute</Button>
        <Button variant="contained" onClick={() => callMethod("destroy")}>All UnMute</Button>
      </div>
    </div>
  </div>
  )
}

export default AboutPage