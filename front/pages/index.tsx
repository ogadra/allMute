import { GetServerSideProps } from 'next';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Header from '../components/header';
import Ogps from '../components/OGP';

const useStyles = makeStyles({
    root: {
      '& > *': {
        margin: "auto",
        width: "150px",
        display: "block",
        textAlign: "center"
      },
    },
  },
);

export interface Message{
  message: string;
}

const IndexPage = () => {
  const login = () =>{
    axios.get('./api/proxy/twitter/oauth').then((res) => {
      console.log(res);
      switch (res.status){
        case 200:
          location.href = res.data.url;
          break
      }
    })
  }

  const classes = useStyles();
  return(
    <div className={classes.root}>
      <Ogps/>
      <Header title="ツイッターを破壊" />
      <div>
        <Button variant="contained" color="primary" onClick={login}>Log in</Button>
      </div>
    </div>
  )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query;

  return {props: id};
}