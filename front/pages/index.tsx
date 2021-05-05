import { GetServerSideProps } from 'next';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios';

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
      console.log(res.headers);
      switch (res.status){
        case 200:
          location.href = res.data.url;
          break
      }
    })
  }

  // const display = () => {
    
  //   axios.get(`${process.env.NEXT_PUBLIC_FRONT_SERVER}/api/proxy/twitter`).then((res) => {
  //     console.log(res.data.user);
  //   })
  // }

  const classes = useStyles();
  return(
    <div className={classes.root}>
      <title>ツイッターを破壊</title>
        <br/>
        <Button variant="contained" color="primary" onClick={login}>Log in</Button>
    </div>
  )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query;

  return {props: id};
}