import EventEmitter2 from 'eventemitter2';
import * as events from './events';

export default class Client {
  constructor(defaults) {
    this.defaults = defaults;
    this.eventEmitter = new EventEmitter2();
    this._middleware = [];
  }

  _callOnStarts(request) {
    let i = 0;
    while (i < this._middleware.length) {
      if (this._middleware[0].onStart) {
        request = this._middleware[0].onStart(request);
      }
      i += 1;
    }

    return request;
  }

  fetch(path, options) {
    let request = new Request(path, options);
    this.eventEmitter.emit(events.REQUEST_START, request);
    request = this._callOnStarts(request);

    return fetch(request)
      .then(response => {
        this.eventEmitter.emit(events.REQUEST_SUCCESS, request, response);
        return response;
      })
      .catch(err => {
        this.eventEmitter.emit(events.REQUEST_FAIL, request, err);
        throw err;
      });
  }

  addMiddleware(middleware) {
    this._middleware.push(middleware);
  }

  removeMiddleware(name) {
    let i = 0;
    for (i; i < this._middleware.length; i++) {
      if (this._middleware[i].name === name) {
        this._middleware.splice(i, 1);
        i -= 1;
      }
    }
  }

  on(event, cb) {
    this.eventEmitter.on(event, cb);
  }
}
