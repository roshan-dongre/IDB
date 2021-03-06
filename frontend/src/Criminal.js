import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import Geocode from "react-geocode";
import {Row, Col, Panel, Button, Modal, Well} from 'react-bootstrap'

/*Inline styles for the components */
var imageStyles = {
    width: '400px',
    height: '350px'
}

var textStyles = {
    color: 'black'
}

var wellStyles = {
    background: '#7f8fa6'
}

export default class Criminal extends Component {
    constructor (props) {
        super (props);
        let item = "";

        /*Constructor to get the correct item */
        if ('location' in this.props  && this.props.location.state.item !== undefined) {
            item = this.props.location.state.item
        } else if (this.props.item !== undefined) {
            item = this.props.item
        }

        this.state = {
            item: item,
            crimes: [],
            totalCount: 0,
            zoom: 11,
            selectedId: "",
            navigate: false,
            navigateTo: "",
            data_states: [],
            data_crimes: [],
            unknown: "Unknown",
            crimeUnavailable: "No crimes available",
            stateUnavailable: "No states available",
            center: {
                lat: 37.0902,
                lng: -95.7129
            },
            reload: false 
        }
    }

    componentDidMount () {
        this.callAPI()
        this.getCoor()
        this.getStates()
        this.getCrimes()
    }

    /*Called when the component updates */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.item.name !== this.state.item.name)
        {
            this.getStates()
            this.getCrimes()
            this.changeValues()
            this.getCoor()    
        }
    }

    /*Gets the state list from the API */
    getStates() {
        let url = "http://api.ontherun.me/criminalstostate/" + this.state.item.id
        let self = this
        axios.get(url)
            .then((res) => {
                self.setState({data_states: res.data});
            })
            .catch((error) => {
                console.log(error)
            });   
    }

    /*Gets the crime list from the API */
    getCrimes() {
        if (this.state.item.id !== undefined) {
            let url = "http://api.ontherun.me/criminaltocrimes/" + this.state.item.id 
            let self = this
            axios.get(url)
                .then((res) => {
                    self.setState({data_crimes: res.data});
                })
                .catch((error) => {
                    console.log(error)
                });
            }
    }

    /*API call that has get the information needed */
    callAPI() {
        let url
        if (this.props.location !== undefined && this.props.location.state.selectedId !== undefined) {
            url = "http://api.ontherun.me/criminals/"+this.props.location.state.selectedId
        } else {
            url = "http://api.ontherun.me/criminals/"+this.state.item.id
        }
        let self = this
        axios.get(url)
            .then((res) => {
                self.setState({item: res.data});
            })
            .catch((error) => {
                console.log(error)
            });
    }

    /*Navigation to the other instances */

    handleStateNavigation(stateId, e) {
        e.preventDefault()
        this.setState({
            navigate: true,
            navigateTo: "/State",
            selectedId: stateId
        })
    }

    handleCrimeNavigation(crimeId,e) {
        e.preventDefault()
        this.setState({
            navigate: true,
            navigateTo: "/Crime",
            selectedId: crimeId
        })
    }

    /*Cleaning up for the crime information from the API */
    changeValues() {
        console.log(this.state)
        var striptags = require('striptags');
        this.state.item.crime = striptags(this.state.item.crime)
        if (this.state.item.eyes !== null) {
            this.state.item.eyes = this.state.item.eyes.slice(0,1).toUpperCase() + this.state.item.eyes.slice(1, this.state.item.eyes.length)
        }
        if (this.state.item.hair !== null) {
            this.state.item.hair = this.state.item.hair.slice(0,1).toUpperCase() + this.state.item.hair.slice(1, this.state.item.hair.length)
        }   
    }

    /*Gets the coordinates used for the google maps API */
    getCoor() {
        let self = this
        Geocode.fromAddress(this.state.item.field_office).then(
          response => {
            const { lat, lng } = response.results[0].geometry.location;
            self.setState({center: {lat: lat, lng: lng}})
          },
          error => {
            console.error(error);
          }
        );
    }

    /*Render method to show the website information */
    render() {

        if (this.state.item != "") {
            this.changeValues()
        }
        
        this.getCoor()

        if (this.state.reload === true) {
            window.location.reload()
        }

        if (this.state.navigate) {
            return <Redirect to={{pathname: this.state.navigateTo, state: {selectedId: this.state.selectedId, reload: true}}} push={true} />;
        }
        
        let stateList
        let self = this

        /*Gets the list of states and list of crimes */

        stateList = this.state.data_states.map((state) => {

            return (
                <tr className="clickable-row" onClick={(e) => self.handleStateNavigation(state.state_name, e)}>
                    <td><strong>{state.state_name}</strong></td>
                </tr>
            );
        })
        if (stateList.length === 0) {
            stateList = this.state.stateUnavailable
        }

        let crimeList

        crimeList = this.state.data_crimes.map((crime) => {
            return (
                <tr className="clickable-row" onClick={(e) => self.handleCrimeNavigation(crime.crime_id, e)}>
                    <td><strong>{crime.crime_name}</strong></td>
                </tr>
            );
        })
        if (crimeList.length === 0) {
            crimeList = this.state.crimeUnavailable
        }

        /*Rendering with the information */
        return (
            <div className="container sub-container">
                <div className="row">
                    <div className="col-md-4">
                        <div className="text-center" style={{ height: '300px', width: '350px' }}>
                            <img className=" img-thumbnail img-thumbnail-sm" src={this.state.item.image === undefined ? this.state.item.images : this.state.item.image} alt={this.state.item.name} style = {imageStyles}/>
                            <text> Field Office </text>
                            <GoogleMapReact
                              bootstrapURLKeys={{ key: "AIzaSyDkRhH7iB4iZW9dDa-FY7HYb8vpjj19Vsc"}}
                              defaultCenter= {this.state.center}
                              defaultZoom={this.state.zoom}
                            >
                            </GoogleMapReact>
                        </div>
                    </div>
                    <div className="col-md-8" style= {textStyles}>
                        <Well style= {wellStyles}>
                        <h3 className="sub-header">{this.state.item.name}</h3>
                        <table className="table table-responsive text-left">
                            <tbody>
                            <tr>
                                <td><strong>DOB:</strong></td>
                                <td>{this.state.item.dob == null ? this.state.unknown : this.state.item.dob}</td>
                            </tr>
                            <tr>
                                <td><strong>Gender:</strong></td>
                                <td>{this.state.item.sex == null ? this.state.unknown : this.state.item.sex}</td>
                            </tr>
                            <tr>
                                <td><strong>Eyes:</strong></td>
                                <td>{this.state.item.eyes == null ? this.state.unknown : this.state.item.eyes}</td>
                            </tr>
                            <tr>
                                <td><strong>Hair:</strong></td>
                                <td>{this.state.item.hair == null ? this.state.unknown : this.state.item.hair}</td>
                            </tr>
                            <tr>
                                <td><strong>Height:</strong></td>
                                <td>{this.state.item.height == null ? this.state.unknown : this.state.item.height} Inches</td>
                            </tr>
                            <tr>
                                <td><strong>Race:</strong></td>
                                <td>{this.state.item.race == null ? this.state.unknown : this.state.item.race}</td>
                            </tr>
                            <tr>
                                <td><strong>Nationality:</strong></td>
                                <td>{this.state.item.nationality == null ? this.state.unknown : this.state.item.nationality}</td>
                            </tr>
                            <tr>
                                <td><strong>Page:</strong></td>
                                <td><strong><a href={this.state.item.fbi == null ? this.state.unknown : this.state.item.fbi} style={{ color: '#000' }}>{this.state.item.fbi == null ? this.state.unknown : this.state.item.fbi}</a></strong></td>
                            </tr>
                            <tr>
                                <td><strong>State:</strong></td>
                                <td> {stateList}</td>
                            </tr>
                            <tr>
                                <td><strong>Crime:</strong></td>
                                <td>{crimeList}</td>
                            </tr>
                            <tr>
                                <td><strong>Description:</strong></td>
                                <td>{this.state.item.crime}</td>
                            </tr>
                           
                            </tbody>
                        </table>
                        </Well>
                    </div>
                </div>
            </div>
        );
    }
}