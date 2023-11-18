import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
 //Interface helps define the values an entity must have (like Java interfaces to methods)
 //Anytime a type of IState is use,d it should always have data and showGraph as properties.
interface IState {
  data: ServerRespond[],
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [],
      //This is the default state, we add showGraph because it is an IState interface now and needs to honor what properties an IState has
      //It is false because we do not want the graph to show until we click the Start Streaming Data button.
      showGraph: false,
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
  //add conditional to check and render graph only if showGraph is true
  if(this.state.showGraph){
    return (<Graph data={this.state.data}/>)
    }
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
  let x = 0;
  const interval = setInterval(() => {
  //get data from server
    DataStreamer.getData((serverResponds: ServerRespond[]) => {
      // Update the state by creating a new array of data that consists of
      // Previous data in the state and the new data from server
      //Set the state of the app. As it is an IState, it will have data and showGraph.
      this.setState({
      //We set the data to the response, and the graph will be true once we get the data on button click.
       data: serverResponds,
        showGraph: true,
        });
    });
    x++;
    if (x > 1000){
    clearInterval(interval);
    //We are looping this function, in intervals of 100ms.
    }
  } , 100);
}
  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
