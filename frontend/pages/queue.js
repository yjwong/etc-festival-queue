import React, { Component } from 'react';
import axios from 'axios';
import MaskedInput from 'react-maskedinput';
import classNames from 'classnames';

export default class QueuePage extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      queue: {},
      phone: '',
      submitting: false,
      success: false,
      error: false,
      errorDetails: ''
    };
    this.state = this.initialState;
  }

  componentDidMount() {
    this.getQueue(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.initialState);
    this.getQueue(nextProps.params.id);
  }

  async getQueue(id) {
    const queue = await axios.get(`/api/queues/${id}`);
    this.setState(Object.assign({}, this.state, { queue: queue.data }));
  }

  async appendQueue(id, phone) {
    this.setState(Object.assign({}, this.state, { submitting: true }));
    try {
      const res = await axios.post(`/api/queues/${id}/append`, { phone: phone });
      this.setState(Object.assign({}, this.state, {
        success: true,
        phone: this.initialState.phone
      }));
    } catch (e) {
      this.setState(Object.assign({}, this.state, { error: true }));
      if (e.response) {
        switch (e.response.status) {
        case 400:
          this.setState(Object.assign({}, this.state, { errorDetails: e.response.data }));
          break;
        case 409:
          this.setState(Object.assign({}, this.state, {
            errorDetails: 'This phone number has already been added to the queue.'
          }));
          break;
        default:
          this.setState(Object.assign({}, this.state, {
            errorDetails: 'There was an unknown problem.'
          }));
        }
      } else {
        this.setState(Object.assign({}, this.state, {
          errorDetails: 'There seems to be a problem reaching our servers.'
        }));
      }
    } finally {
      this.setState(Object.assign({}, this.state, { submitting: false }));
    }
  }

  onPhoneChanged(e) {
    this.setState(Object.assign({}, this.state, { phone: e.target.value }));
  }

  onSuccessMessageCloseIconClicked() {
    this.setState(Object.assign({}, this.state, { success: false }));
  }

  onErrorMessageCloseIconClicked() {
    this.setState(Object.assign({}, this.state, { error: false }));
  }

  onSubmitClicked() {
    this.appendQueue(this.props.params.id, this.state.phone);
  }

  render() {
    return (
      <div>
        <h1 className="ui header">{this.state.queue.name}</h1>
        <div className="ui form">
          <div className="ui message">
            <div className="header">Queue Too Long?</div>
            <p>To be notified when the queue is short, leave your phone number here and we'll text you.</p>
          </div>
          <If condition={this.state.success}>
            <div className="ui positive message">
              <i className="close icon" onClick={this.onSuccessMessageCloseIconClicked.bind(this)}></i>
              <div className="header">All done!</div>
              <p>We'll contact you when the queue is short. Thank you for your patience!</p>
            </div>
          </If>
          <If condition={this.state.error}>
            <div className="ui negative message">
              <i className="close icon" onClick={this.onErrorMessageCloseIconClicked.bind(this)}></i>
              <div className="header">There was a problem.</div>
              <If condition={Array.isArray(this.state.errorDetails)}>
                <ul className="list">
                  <For each="item" of={this.state.errorDetails}>
                    <li key={item.msg}>{item.msg}</li>
                  </For>
                </ul>
              </If>
              <If condition={!Array.isArray(this.state.errorDetails)}>
                <p>{this.state.errorDetails}</p>
              </If>
            </div>
          </If>
          <div className="field">
            <label>Phone Number</label>
            <MaskedInput
              type="tel"
              mask="(111) 111-1111"
              name="phone"
              placeholder="(123) 456-7890"
              value={this.state.phone}
              onChange={this.onPhoneChanged.bind(this)} />
          </div>
          <button
            className={classNames('ui primary submit button', { disabled: this.state.submitting })}
            onClick={this.onSubmitClicked.bind(this)}>
            Let me know!
          </button>
        </div>
        {this.props.children}
      </div>
    )
  }
}