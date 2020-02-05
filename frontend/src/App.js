import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import axios from "axios";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Comparator from './components/Comparator';

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
      },
      form: {
        width: '100%',
        marginTop: theme.spacing(1),
      },
      submit: {
        margin: theme.spacing(3, 0, 2),
      },
  });

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          data:[],
          charged: 0
        }
    }
    
    componentDidMount(){
       document.title = "Comparator"
    }

    Copyright() {
        return (
          <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://www.instagram.com/coronavirus36/?hl=fr">
              Comparator - A school project
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        );
    }

    authentificate(username, password) {
        axios({
          "method":"GET",
          "url":"http://127.0.0.1:8080/users/login",
          "params":{
            "username": username,
            "password": password
          }
        })
        .then((response)=>{
          if (response.data.status == "OK") {
            this.setState({charged: 1});
            console.log(response.data)
          } else {
            alert("Error when trying to login, please try again")
            console.log(response.data)
          }
        })
        .catch((error)=>{
          alert("Error when trying to login, please try again" + error)
        })
    }

    register(username, password) {
      axios({
        "method":"GET",
        "url":"http://127.0.0.1:8080/users/register",
        "params":{
          "username": username,
          "password": password
        }
      })
      .then((response)=>{
        if (response.data.status == "OK") {
          alert("User successfully registered")
          console.log(response.data)
        } else {
          alert("Error when trying to register, please try again")
          console.log(response.data)
        }
      })
      .catch((error)=>{
        alert("Error when trying to register, please try again" + error)
      })
  }

    render() {
        const {classes} = this.props;
        if (this.state.charged == 1) {
          return (
            <Comparator/>
          );
       } else if (this.state.charged == 0) {
            return (
                <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                  <Typography component="h1" variant="h5">
                    C O M P A R A T O R
                  </Typography>
                  <form className={classes.form} noValidate>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                    />
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      onClick={() => this.authentificate(document.getElementById("email").value, document.getElementById("password").value)}
                    >
                      Connexion
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      onClick={() => this.register(document.getElementById("email").value, document.getElementById("password").value)}
                    >
                      Sign UP
                    </Button>
                    <Grid container>
                      <Grid item xs>
                        <Link href="#" variant="body2">
                          Forgotten password ? Tant pis pour toi chacal.
                        </Link>
                      </Grid>
                    </Grid>
                  </form>
                </div>
                <Box mt={8}>
                  {this.Copyright()}
                </Box>
              </Container>
            );
        }
    }
}

App.propTypes = {
    /**
     * The component's css
     */
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);