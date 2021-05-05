import { GetServerSideProps } from 'next';
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
        margin: theme.spacing(1),
        flexGrow: 1,
      },
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
    axios.get('./api/proxy/twitter').then((res) => {
      console.log(res.data.user);
      setData(res.data.user);
      })
  }, [])

  const get = () => {
    axios.post('./api/proxy/twitter/post').then((res) =>{
      console.log(res);
    })
  }


  return (
  <div className={classes.root}>
    <title>hoge</title>
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
    <Button variant="contained" color="primary" onClick={get}>Log in</Button>
  </div>
  )
}

export default AboutPage

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   //const id = context.query;
//   const cookie = context.req?.headers.cookie;
//   const res = await fetch('http://localhost:8080/twitter',{
//     headers: {
//       cookie: cookie!
//     }
//   });
//   const data = await res.json();
//   console.log(data);
//   console.log(res);
//   return {props: res};
// }