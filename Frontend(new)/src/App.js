import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import PageHeader from "./components/PageHeader/PageHeader";
import Device from "./components/Device";
import History from "./components/History"; 

class App extends Component {
  render() {
    return (
    	<Router>
	      <div className="App">
	        <Route path='/' component={PageHeader} />
	        <Route exact path='/' component={Device} />
	        <Route path='/history/:id' component={History} />
	      </div>
	    </Router>
    )
  }
}

export default App;
