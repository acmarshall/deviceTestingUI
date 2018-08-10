import React, {Component} from 'react';
import axios from "axios/index";
import ReactLoading from 'react-loading';
import PHONE from './img/PHONE.png';
import TABLET from './img/TABLET.png';
import swal from 'sweetalert2';
import { Link } from 'react-router-dom';

class Device extends Component {

    constructor() {
        super();
        this.state = {
            info: [],
            report: [],
            header: {}
        }
    }

    componentDidMount() {
        axios.get('http://localhost:3002/info').then((response) => {
            this.setState({info: response.data})
        }).catch((error) => {
            console.log(error);
        })

        axios.get('http://localhost:3002/devices').then((response) => {
            this.setState({report: response.data})
        }).catch((error) => {
            console.log(error);
        })

        axios.get('http://localhost:3002/header').then((response) => {
            this.setState({header: response.data})
        }).catch((error) => {
            console.log(error);
        })

    }

    showData() {

        const currentUrl = window.location.hostname
        let data = this.state.report; 
        let info = this.state.info; 
        if(data.length === 0 || info.length === 0) {
            return (
                <ReactLoading className = 'loading' type = 'spinningBubbles' color = '#FFA500' height = {50} width = {50} />
                )
        } else {
            let deviceName = [];
            let deviceType = [];
            let deviceFrom = [];
            let deviceOs = [];
            let version = [];
            let numOfBuild = [];
            let testDetail = [];
            let testcasesrender = [];

            for(let key in data) {
                if(key !== "_id") {
                    //console.log(info, key)
                    deviceName.push(key);
                    numOfBuild.push(data[key].build);
                    testDetail.push(data[key].tests);
                    deviceType.push(info[key].category);
                    deviceFrom.push(info[key].manufacture);
                    deviceOs.push(info[key].os);
                    version.push(info[key].version);
                }
            }

            return deviceName.map((data,index)=>
               <div className = "col-lg-3">
                    <div className =  {this.borderColor(testDetail[index][testDetail[index].length-1])} key = {index}>
                        <h3> Device Name: {deviceName[index]} </h3>
                            <div style = {{float:"left"}}>
                            {`${deviceFrom[index]}-${deviceOs[index]}`}
                            </div>
                            <div style = {{float: "right"}}> 
                           {deviceType[index] === 'PHONE' && <img className = 'img' src= {PHONE} />}
                           {deviceType[index] === 'TABLET' && <img className = 'img' src = {TABLET} />}
                            </div>
                        <br/>
                        <div style = {{float: "left"}}>
                            Version: {version[index]}
                            </div>
                        <br/>
                        <br/>
                        <div style = {{float: "left"}}><button onClick = { ()=> { this.showPassedTest(testDetail[index][testDetail[index].length-1].testcases) } }className = 'btn-success'>
                        Passed Cases: {testDetail[index][testDetail[index].length-1].pass}
                        </button>
                        </div>
                       
                        <div style = {{float:"right"}}><button onClick = { ()=> { this.showFailedTest(testDetail[index][testDetail[index].length-1].testcases) } }className = 'btn-danger'>
                        Failed Cases: {testDetail[index][testDetail[index].length-1].fail}
                        </button>
                        </div> 
                        <br/>
                        <br/>
                        <div>
                        <Link to={`/history/${deviceName[index]}`}> <button className = 'btn-secondary'>
                        History
                        </button>
                        </Link> 
                        </div> 
                        <br/>                                     
                    </div>
                </div>
                
            )

    }
}
    borderColor(color){
        const prefix = 'data'
        if(color.fail > 0) {
            return prefix + ' red'
        } else if (color.fail = 0){
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

    showHeader(){
        let header = this.state.header; 
        console.log(header)
        console.log(Object.values(header))
        console.log(Object.values(header)[0])

        return(
            <h4> <b> Last Run On: </b>
            {" "}{Object.values(header)[6]} at 
            {" "}{Object.values(header)[7]} 
            {" "}<br/> <b> Elapsed Time: </b> {Object.values(header)[4]}
            </h4>
            )
    }


    render() {
            return (
                <React.Fragment>
                    <h1>Current Devices</h1>
                    <div className = "header col-sm-10 col-sm-offset-1"> {this.showHeader()} </div>
                        {this.showData()}
                </React.Fragment>
            )
    }
}

export default Device