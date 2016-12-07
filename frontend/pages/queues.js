import React, { Component } from 'react';
import { Link } from 'react-router';
import axios from 'axios';

export default class QueuesPage extends Component {
  constructor(props) {
    super(props);
    this.state = { queues: [] };
  }

  async componentDidMount() {
    const queues = await axios.get('/api/queues');
    this.setState(
      Object.assign({}, this.state, {
        queues: queues.data.sort((a, b) => a.name > b.name)
      })
    );
  }

  render() {
    return (
      <div className="ui container">
        <div className="ui very padded stackable grid">
          <div className="sixteen wide column">
            <img className="ui fluid image" src="banner.png" alt="Banner" />
          </div>
          <div className="four wide column">
            <h1 className="ui header">Stations</h1>
            <div className="ui vertical menu">
              <For each="item" of={this.state.queues}>
                <Link className="item" key={item.id} to={`/queues/${item.id}`} activeClassName="active">
                  {item.name}
                </Link>
              </For>
            </div>
          </div>
          <div className="twelve wide column">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
};