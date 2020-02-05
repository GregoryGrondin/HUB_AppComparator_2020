import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, CardHeader ,Typography, Avatar} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from "axios";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

const styles = theme => ({
  title: {
    fontWeight: 700,
    margin: 50,
  }, 
  refresh: {
    margin: 12,
  },
  paper: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

class Comparator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[""],
      charged: 0
    }
  }

  request() {
    axios({
      "method":"GET",
      "url":"http://127.0.0.1:8080/products/research",
      "params":{
        "search": document.getElementById("search_field").value
      }
    })
    .then((response)=>{
      if (response.data && response.data.status == "OK") {
         this.setState({charged: 1, data: response.data.data});
      }
      console.log(this.state.data)
    })
    .catch((error)=>{
      console.log(error)
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.paper}>
    <Card>
      <CardHeader title="C O M P A R A T O R" className={classes.title}/>
      <CardContent>
        <Grid>
        <TextField id="search_field" variant="filled" />
        <Button variant="contained" color="secondary" className={classes.refresh}  
                onClick={() => this.request()} m={10}>
          Search
        </Button>
        {this.state.data.map(res=> {
              if (this.state.charged == 1) {
                return  (
                  <ExpansionPanel expanded>
                  <ExpansionPanelSummary
                    id={res.product.id}
                  >
                  <Typography>{res.product.name}</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                  <Typography>
                    Description : {res.product.description}
                  </Typography>
                  </ExpansionPanelDetails>
                  <ExpansionPanelDetails>
                  <Typography>
                    Price : {res.product.price}
                  </Typography>
                  </ExpansionPanelDetails>
                  <ExpansionPanelDetails>
                  <Typography>
                    Vendor : {res.product.vendor}
                  </Typography>
                  </ExpansionPanelDetails>
                  </ExpansionPanel>)
              }
            })}
        </Grid>
      </CardContent>
    </Card>
    </div>
    )
  }
}

Comparator.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
    /**
   * The component's style.
   */
  classes: PropTypes.object.isRequired,
};

Comparator.defaultProps = {
  title: "Comparator",
};

export default withStyles(styles)(Comparator);