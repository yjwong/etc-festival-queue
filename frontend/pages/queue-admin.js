import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';

export default class QueueAdminPage extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      waiters: [],
      advanceCount: 5
    };
    this.state = this.initialState;
  }

  componentDidMount() {
    this.getWaitersFromQueue(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.initialState);
    this.getWaitersFromQueue(nextProps.params.id);
  }

  async getWaitersFromQueue(id) {
    const waiters = await axios.get(`/api/queues/${id}/waiters`);
    this.setState(Object.assign({}, this.state, { waiters: waiters.data }));
  }

  async advanceQueue(id, count) {
    await axios.post(`/api/queues/${id}/advance`, { count: count });
  }

  onAdvanceCountChanged(e) {
    this.setState(Object.assign({}, this.state, { advanceCount: e.target.value }));
  }

  async onAdvanceClicked() {
    await this.advanceQueue(this.props.params.id, this.state.advanceCount);
    this.getWaitersFromQueue(this.props.params.id);
  }

  render() {
    return (
      <div>
        <div className="ui divider"></div>
        <h2 className="ui header">Administration</h2>
        <h3 className="ui header">Items in Queue</h3>
        <If condition={this.state.waiters.length > 0}>
          <ul className="ui list">
            <For each="item" of={this.state.waiters}>
              <li key={item.id}>{item.phone} ({moment(item.createdAt).fromNow()})</li>
            </For>
          </ul>
        </If>
        <If condition={this.state.waiters.length === 0}>
          <p>There are currently no items in queue.</p>
        </If>

        <h3 className="ui header">Advance Queue</h3>
        <div className="ui form">
          <div className="field">
            <div className="ui action input">
              <input
                type="number"
                name="advanceCount"
                defaultValue={5}
                onChange={this.onAdvanceCountChanged.bind(this)} />
              <button
                className="ui primary button"
                onClick={this.onAdvanceClicked.bind(this)}>
                Advance
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}