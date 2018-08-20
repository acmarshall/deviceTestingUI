import React, {Component} from 'react'; 
import axios from "axios/index"; 

class BackEnd extends Component {

	componentDidMount() {
		axios.get('http://localhost:3001/').then((response) => {
			console.log(response.data)
		}).catch((error) => {
			console.log(error); 
		})
		axios.get('http://localhost:3001/update').then((response) => {
			console.log(response.data)
		}).catch((error) => {
			console.log(error); 
		})

		axios.get('http://localhost:3001/parsed').then((response) => {
			console.log(response.data)
		}).catch((error) => {
			console.log(error); 
		})

		axios.get('http://localhost:3001/header').then((response) => {
			console.log(response.data)
		}).catch((error) => {
			console.log(error); 
		})

		axios.get('http://localhost:3001/info').then((response) => {
			console.log(response.data)
		}).catch((error) => {
			console.log(error); 
		})
	}

		render() {
			return(null)
		}

	}


export default BackEnd