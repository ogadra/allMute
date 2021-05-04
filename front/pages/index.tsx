import { GetServerSideProps } from 'next';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

export interface Message{
  message: string;
}

const IndexPage = (id: string[]) => {
  const login = () =>{
    axios.get('./api/proxy/twitter/oauth').then((res) => {
      console.log(res.headers);
      switch (res.status){
        case 200:
          location.href = res.data.url;
          break
      }
    })
  }

  const display = () => {

    axios.get(`http://localhost:3000/api/proxy/twitter`).then((res) => {
      console.log(res.data.user);
    })
  }

  const classes = useStyles();
  return(
    <div className={classes.root}>
      <title>hoge</title>

        <Button variant="contained" color="primary" onClick={login}>Log in</Button>
    </div>
  )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query;

  return {props: id};
}