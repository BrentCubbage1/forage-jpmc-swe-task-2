import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
 //We are extending HTMLElement so that thje PerspectiveViewerElement behaves like an HTMLElement.
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      //'view' is the kind of graph we want to see. It's a continuous line graph, so we use 'y_line'
      elem.setAttribute('view', 'y_line');
      //'column_pivots' is where the stocks will separate, so we can distinguish them. '["stock"]' is the value as it will take the string name of Stock of the entity
      elem.setAttribute('column-pivots', '["stock"]');
      //'row-pivots' does our x-axis. Maps each datapoint based on its "timestamp" x-axis would be blank without rows being declared.
      elem.setAttribute('row-pivots', '["timestamp"]');
      //This is setting the 'columns' that will be along the y-axis. It would normally do each part of the stock. We only care about the "top_ask_price"
      elem.setAttribute('columns', '["top_ask_price"]');
      //'aggregates' allows us to handle the duplicated data and consolidate it into a single data point.
      //We check if it has a distinct name and timestamp with the "distinct count".
      //If there are duplicates, we grab "top_bid_price" and "top_ask_price" and get the averages of them similar points with "avg".
      elem.setAttribute('aggregates',`
      {"stock":"distinct count",
      "top_ask_price":"avg",
      "top_bid_price":"avg",
      "timestamp":"distinct count"} `);
      // Add more Perspective configurations here.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
