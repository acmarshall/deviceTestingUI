import React, {Component} from 'react'; 
import Device from './Device'; 
import axios from "axios/index";
import ReactLoading from 'react-loading';
import PHONE from './img/PHONE.png';
import TABLET from './img/TABLET.png';
import swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import {DropdownMenu, MenuItem, DropdownButton} from 'react-bootstrap-dropdown-menu'


class History extends Component{

	constructor(){
		super(); 
		this.state = {
			info: [], 
			device: [], 
			header: []
		}
	}

	componentDidMount() {

		axios.get("http://localhost:3002/deviceHistory/").then((response) => {
			//console.log(response.data)
			this.setState({device: response.data})
        }).catch((error) => {
            console.log(error);
        })

        axios.get("http://localhost:3002/headerHistory/").then((response) => {
        	//console.log(response.data)
			this.setState({header: response.data})
        }).catch((error) => {
            console.log(error);
        })

        axios.get("http://localhost:3002/info/").then((response) => {
			this.setState({info: response.data})
        }).catch((error) => {
            console.log(error);
        })
	}

	showData() {
		let device = this.state.device; 
		let header = this.state.header; 
		const id = this.props.match.params.id; 

		let keyArr = []; 
		let deviceArr = []; 
		let dev = [];
		let date =[]; 
		let timestamp = []; 
		let time = []; 

		for (let key in device) {
			keyArr.push(key);
			deviceArr.push(device[key]);
			if(header[key] == undefined || null) {
				console.log("broken")
			} else {
				date.push(header[key].date)
				timestamp.push(header[key].timestamp)
				time.push(header[key].time)
			}

		}

	
		deviceArr.map((data,index)=> {
			const idName = Object.keys(data)
			const idList = Object.values(data)

			for(let i = 0; i< idName.length; i++) {
				if(idName[i] == id){
					dev.push(idList[i])
						}
				}
			
		}
			)
		

		return keyArr.map((data,index)=> 
			<div className = "col-lg-3">
				<div className = {this.borderColor(dev[index].tests[0])} key = {index}>
					<div className="panel-group">
					  <div className="panel panel-default">
					    <div className="panel-heading">
					      <h4 className="panel-title">
					        <a data-toggle="collapse" href= {`#collapse${[index]}`}>{date[index] + " at " + timestamp[index]}</a>
					      </h4>
					    </div>
					    <div id= {`collapse${[index]}`} className="panel-collapse collapse">
					      <div className="panel-body">
					      	<div>
						Build Time: {time[index]}
						</div>

						<div style = {{float:"left"}}><button onClick = { ()=> {this.showPassedTest(dev[index].tests[0].testcases)}} className = 'btn-success'>
						Passed Cases: {dev[index].tests[0].pass}
						</button>
						</div>

						<div style = {{float:"right"}}><button onClick = { ()=> {this.showFailedTest(dev[index].tests[0].testcases)}} className = 'btn-danger'>
						Failed Cases: {dev[index].tests[0].fail}
						</button>
						</div>

					      </div>
					     
					    </div>
					  </div>
					</div>
				</div>
				
			</div>
		)
}


borderColor(color) {
	console.log(color.fail)
	const prefix = 'historyData'
	if(color.fail > 0) {
		return prefix + ' red'
	} else if (color.fail == 0) {
		return prefix + ' green'
	}
}

 showPassedTest(testDetail){
        let stepsArr = []; 
        let detailsArr = []; 
        testDetail.map((data, index)=>{
            if (testDetail[index].status == "Passed") {
        let  details = `Test Name: ${testDetail[index].name}`
            detailsArr.push(details); 
            stepsArr.push(testDetail[index].steps); 
            } 
        })
        if(detailsArr.length == 0){
            swal({
                title: 'None of these tests have passed',
                type: 'error',
                timer: 1500, 
            }
            )
        } else {

            let myArray = []

            for(let i =0; i <detailsArr.length; i++){
                let obj = {id: i+1, name: `${detailsArr[i].replace(/([A-Z])/g, ' $1').trim()}`}
                myArray.push(obj); 
            }
            
            let options = {}; 
            myArray.map((data,index)=>{
                options[myArray[index].id] = myArray[index].name;  
            }); 

            const {value: testing} = swal({
                title: '<span style = "color: #449d44"> Passed Testcases <span>', 
                input: 'select', 
                inputOptions: options, 
                inputPlaceholder: 'Select test to see steps',
                allowOutsideClick: 'false',
                allowEscapeKey: 'false', 
                allowEnterKey: 'false',
                showCancelButton: 'true',
                inputValidator: (value) => {
                    return new Promise((resolve)=> {
                        if(value) {
                            resolve()
                        } else {
                            resolve('You need to select a test')
                        }
                    })
                }
            
            }).then((inputValue)=>{
                if (inputValue.dismiss){
                    console.log("You canceled")
                } else if(inputValue) {
                    for(let i = 0; i < Object.values(inputValue).length; i++) {
                        //console.log(stepsArr[parseInt(Object.values(inputValue)[i])-1])
                        this.showSteps(stepsArr[parseInt(Object.values(inputValue)[i])-1])
                        }

                    
                }
            })
        }
    }
 
    showFailedTest(testDetail){
        //console.log(testDetail)
        let stepsArr = []; 
        let detailsArr = []; 
        let hidden = false;
        testDetail.map((data, index)=>{
            if (testDetail[index].status == "Failed") {
        let  details = `Test Name: ${testDetail[index].name} \n
            Passes: ${testDetail[index].pass} \n
            Fails: ${testDetail[index].fail} \n`
            // Status: ${testDetail[index].status}`
            detailsArr.push(details); 
            stepsArr.push(testDetail[index].steps); 
        console.log(testDetail[index].steps);
        //console.log(stepsArr);
            } 
        })
        if(detailsArr.length == 0){
            swal({
                title: 'None of these tests have Failed',
                type: 'error',
                timer: 1500, 
            }
            )
        } else {
            let myArray = []

            for(let i =0; i <detailsArr.length; i++){
                let obj = {id: i+1, name: `${detailsArr[i].replace(/([A-Z])/g, ' $1').trim()}`}
                myArray.push(obj); 
            }
            
            let options = {}; 
            myArray.map((data,index)=>{
                console.log(myArray[index])
                options[myArray[index].id] = myArray[index].name;  
            }); 

            const {value: testing} = swal({
                title: '<span style = "color: #c12e2a"> Failed Testcases <span>', 
                input: 'select', 
                inputOptions: options, 
                inputPlaceholder: 'Select test to see steps',  
                customClass: 'space',
                allowOutsideClick: 'false',
                allowEscapeKey: 'false', 
                allowEnterKey: 'false',
                showCancelButton: 'true',
                inputValidator: (value) => {
                    return new Promise((resolve)=> {
                        if(value) {
                            resolve()
                        } else {
                            resolve('You need to select a test')
                        }
                    })
                }
            }).then((inputValue)=>{

                if (inputValue.dismiss){
                    console.log("You canceled")
                } else if(inputValue) {
                
                    for(let i = 0; i < Object.values(inputValue).length; i++) {
                        console.log(stepsArr[parseInt(Object.values(inputValue)[i])-1])
                        this.showSteps(stepsArr[parseInt(Object.values(inputValue)[i])-1])
                        }
                    
                    }
                })
            
        }
    }

    showSteps(stepsArr) {
        console.log(stepsArr)
        let detailsArr = []; 
        stepsArr.map((data,index)=> {

            let  details = ` <b> Step Description: </b>  ${stepsArr[index].description} <br>
            <b> Results: </b> ${stepsArr[index].result} <br>
            <b> Status: </b> ${stepsArr[index].status} <hr> `
            detailsArr.push(details);
        })

        swal({
            html: detailsArr.join(" ").replace(/([A-Z])/g, ' $1').trim(),
            customClass: 'steps',
            heightAuto: 'false',
            position: 'top', 
            showCloseButton: 'true'

        })

    }

    showInfo() {
    	let info = this.state.info; 
    	const id = this.props.match.params.id; 

			const idName = Object.keys(info)
			const idList = Object.values(info)

			for(let i = 0; i< idName.length; i++) {
				if(idName[i] == id){
					// console.log(idList[i])
					// console.log(idList[i].category)
					// console.log(idList[i].manufacture)
					// console.log(idList[i].os)
					// console.log(idList[i].version)

					return(
						<div className = "infoBox" >
							<div style = {{float:"left"}}>
							{idList[i].manufacture + "-" + idList[i].os}
							</div>

							<div style = {{float:"right"}}>
							{idList[i].category === 'PHONE' && <img className = 'img' src= {PHONE} />}
                           {idList[i].category === 'TABLET' && <img className = 'img' src = {TABLET} />}
							</div>

							<br/>

							<div style = {{float: "left"}}>
								Version: {idList[i].version}

							</div>

						</div>
						)
						}
				}
    }
	

	render() {
	
		
		const deviceName = this.props.match.params.id
		return (
			<React.Fragment>
			<h2>History</h2>
			<div className = "test">
			<h4> {deviceName} </h4>
			{this.showInfo()}
			</div>
			<br/>
			
			{this.showData()}
			</React.Fragment>

			)
	}
}

export default History; 