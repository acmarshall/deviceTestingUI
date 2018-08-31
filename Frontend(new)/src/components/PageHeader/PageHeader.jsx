import React, {Component} from 'react';
import styles from './PageHeader.css'
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import axios from 'axios';

class PageHeader extends Component {

    constructor() {
        super();
        this.state = {
            platform: null
        }
    }

    componentDidMount() {
        axios.get('http://localhost:3002/header').then((response) => {
            this.setState({platform: response.data})
        }).catch((error) => {
            console.log(error);
        })
    }

    render(){
        let platform;
        if(this.state.platform !== null) {
            platform = this.state.platform;

            return(
                <Navbar inverse collapseOnSelect className='header'>
                  <Navbar.Header>
                    <Navbar.Brand className='header-brand'>
                      <a href="/">JUnit Test Module</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                  </Navbar.Header>
                  <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem>
                            {`${platform.property} / alpha:v4`}
                        </NavItem>
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
            )
        } else {
            return(
                <Navbar inverse collapseOnSelect className='header'>
                  <Navbar.Header>
                    <Navbar.Brand>
                      <a href="/">JUnit Test Module</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                  </Navbar.Header>
                  <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem>
                            alpha:v4
                        </NavItem>
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
            )
        }
    }
}
export default PageHeader

