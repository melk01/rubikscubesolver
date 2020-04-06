import React from 'react';
import axios from 'axios';
import CordaCubeTile from './CordaCubeTile.jsx';
import CordaCubeFormContainer from './CordaCubeFormContainer.jsx';
import MoveQueueVisualizer from '../Visualize/MoveQueueVisualizer.jsx';
import SaveSubmitMenu from '../RubiksMenu/SaveSubmitMenu.jsx';

export default class CordaCubeDashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cordaCubes: [],
            funCube: [ 
                Array(9).fill('O'), 
                Array(9).fill('B'), 
                Array(9).fill('W'), 
                Array(9).fill('R'), 
                Array(9).fill('Y'),
                Array(9).fill('G')
            ]
        }
    }

    componentDidMount() {
        axios.get("http://localhost:10050/api/cube").then((result) => {
            result.data.forEach((cube) => {
                cube.state = this.renderCubeState(cube.state)
            })
            this.setState({ 
                selectedCube: result.data[0] ? result.data[0].linearId : null,
                cordaCubes: result.data 
            })
        }).catch(err => console.log(err))
    }

    selectCube(cubeId) {
        this.setState({
            selectedCube: cubeId
        })
    }

    renderCubeState(cubeState) {
        const translatedCubeState = []
        for (const face in cubeState) {
            const translatedFaceState = []
            for (const faceTile in cubeState[face]) {
                translatedFaceState.push(cubeState[face][faceTile][0])
            }
            translatedCubeState.push(translatedFaceState)
        }
        return translatedCubeState
    }

    render() {
        const shouldRender = this.state.cordaCubes && this.state.cordaCubes.length > 0
        return (
            shouldRender ? <div className = "side-nav-element">
                <div>Distributed Ledger Cubes</div>
                <div className = "cube-tile-container">
                    { this.state.cordaCubes ? this.state.cordaCubes.map((cube) => {
                        return (<CordaCubeTile
                            selected = { this.state.selectedCube == cube.linearId }
                            handleClick = { () => { 
                                this.selectCube(cube.linearId)
                                this.props.handleRenderMove(this.renderCubeState(cube.state)) 
                            } }
                            key = {cube.linearId}
                            issuer = {cube.issuer}
                            linearId = {cube.linearId.slice(0, 6)}
                    />)
                }) : "No cubes to display" }
                </div>
                <SaveSubmitMenu 
                    moveQueue = { this.props.moveQueue }  
                    rerenderCube = { () => { 
                        const selectedCubeState = this.state.cordaCubes.filter(ele => ele.linearId === this.state.selectedCube)
                        this.props.handleRenderMove(this.renderCubeState(selectedCubeState[0].state))
                    }}/>
            </div> : <h3 className = "side-nav-element">No Corda Node Connected</h3>
        )
    }
}