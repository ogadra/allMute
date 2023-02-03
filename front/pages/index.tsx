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
        display: "block",
        textAlign: "center"
      },
      '& > p': {
        width: 'auto',
        fontSize: '1.2em'
      },
      '& > button': {
        width: "150px",
      }
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
        <p>
          ツイッターを破壊アプリケーションはAPI規約の変更によりサービスを終了致しました。<br/>
          長らくご愛顧頂きまして誠にありがとうございました。
        </p>
        <p>
          コードは
          <a href='https://github.com/ogadra/allMute'>
            こちら
          </a>
        </p>
        <Button variant="contained" color="primary" onClick={login} disabled>Log in</Button>
      </div>
    </div>
  )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query;

  return {props: id};
}
