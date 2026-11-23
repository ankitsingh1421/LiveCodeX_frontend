import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {useHistory} from 'react-router-dom'
import { apiUrl } from '../../api';
import './signup.css'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="/">
        LiveCodeX
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  myclass:{
    paddingTop: theme.spacing(8),
    paddingLeft:"0",
    paddingRight:"0"
  },
  paper: {
    marginTop: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const classes = useStyles();


  const [passwordShown, setPasswordShown] = useState(false);

    const showPassword = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const [user, setUser] = useState({
        userName: "",
        email: "",
        password: ""
    });

    let name, value;
    const handleInputs = (e) => {
        name = e.target.name;
        value = e.target.value;
        
        setUser({...user, [name]: value});
    }

    const history = useHistory();

    const postData = async (e) => {
        e.preventDefault();
        const { userName, email, password } = user;
        try {
            const res = await fetch(apiUrl('/register'), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userName, email, password
                })
            });
            const contentType = res.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await res.json() : null;

            if (!res.ok) {
                throw new Error(data?.error || `Registration failed (${res.status})`);
            }
            if (!data) {
                throw new Error('The server returned an invalid response. Please try again.');
            }

            window.alert("Registration Successfull");
            history.push("/login");
        } catch (error) {
            window.alert(error.message || "Unable to register. Please try again.");
        }
    }


  return (
    <Container component="main" maxWidth="xs" >
      <div className={`${classes.myclass}`}>
      <div className="mt-2 p-0 px-2 pb-2 bg-light w-100 pt-4" style={{borderRadius:"10px"}}>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="userName"
                variant="outlined"
                required
                fullWidth
                value={user.userName}
                id="currUsername"
                label="Username"
                onChange={handleInputs}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="currEmail"
                value={user.email}
                label="Email Address"
                name="email"
                onChange={handleInputs}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                value={user.password}
                onChange={handleInputs}
                label="Password"
                type={passwordShown ? "text" : "password"}
                id="currPassword"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" onClick={showPassword}/>}
                label="Show Password"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={postData}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
      </div>
      </div>
    </Container>
  )};