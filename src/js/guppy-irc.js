/**
 * guppy-irc
 *
 * © 2013 Nick Jennings - nick@silverbucket.net
 *
 * guppy-irc is licensed under the AGPLv3.
 * See the LICENSE file for details.
 *
 * The latest version of sockethub can be found here:
 *   git://github.com/silverbucket/guppy-irc.git
 *
 * For more information about sockethub visit:
 *   http://github.com/silverbucket/guppy-irc
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
(function (window, undefined) {
  var app = 'guppy-irc';
  var document = window.document;
  var SockethubClient = window.SockethubClient;

  if ((typeof SockethubClient === 'undefined') ||
      (typeof SockethubClient.connect === 'undefined')) {
    console.log(app + ' ERROR: SockethubClient object not found, be sure to include sockethub-client.js before guppy-irc.js.');
    return false;
  }

  /**
   * Function: getSockethubClient
   *
   * Gets the sockethub configuration from the attributes attached to the
   * passed in element. If there is no existing connection for this `uid` it
   * will attempt to connect and if successful, it is added it to the
   * connection lookup.
   *
   * Parameters:
   *
   *   e  - dom element containing sockethub configuration attributes
   *   cb - function to callback with the connected sockethub client, or if
   *        there are any errors.
   *
   * Returns:
   *
   *   sockethub client object, or error message.
   *   cb(err, client);
   */
  var sockethubClients = {}; // index of sockethub client connection objects
  function getSockethubClient (e, cb) {
    var sockethub = {};
    sockethub.host = e.getAttribute('data-sockethub-host');
    sockethub.port = e.getAttribute('data-sockethub-port');
    sockethub.tls = e.getAttribute('data-sockethub-tls');
    sockethub.path = e.getAttribute('data-sockethub-path');
    sockethub.secret = e.getAttribute('data-sockethub-secret');
    if (sockethub.tls === 'true') {
      sockethub.tls = true;
      sockethub.connectString = 'wss://';
    } else {
      sockethub.tls = false;
      sockethub.connectString = 'ws://';
    }
    sockethub.connectString = sockethub.connectString + sockethub.host + ':' + sockethub.port + sockethub.path;
    sockethub.uid = sockethub.connectString + sockethub.secret;
    var log_id = app + ':' + sockethub.uid;

    if (sockethubClients[sockethub.uid]) {
      cb(null, sockethubClients[sockethub.uid]);
    } else {
      // no existing sockethub connection, so let's connect!
      var sockethubClient = SockethubClient.connect(sockethub.connectString, { register: { secret: sockethub.secret }, reconnect: true });
      sockethubClient.on('registered', function () {
        // connected and registered to sockethub
        sockethubClients[sockethub.uid] = sockethubClient;
        cb(null, sockethubClients[sockethub.uid]);
      });

      sockethubClient.on('failed', function (err) {
        cb('connection to sockethub failed: ' + err);
      });

      sockethubClient.on('disconnected', function () {
        console.log(log_id + ' Sockethub disconnected');
      });
    }
  }

  /**
   * Function: getGuppyConfig
   *
   * Compiles the Guppy config paramaters from the passed in DOM element.
   *
   * Parameters:
   *
   *
   *   e  - dom element containing guppy configuration attributes
   *
   * Returns:
   *
   *   config object
   */
  function getGuppyConfig(e) {
    var cfg = {};
    cfg.id = e.id;
    cfg.title = e.getAttribute('data-title') || 'Guppy IRC Console';
    cfg.width = e.getAttribute('data-width');
    cfg.height = e.getAttribute('data-height');
    cfg.server = e.getAttribute('data-server') || 'irc.freenode.net';
    cfg.channel = e.getAttribute('data-channel') || '#sockethub';
    cfg.nick = e.getAttribute('data-nick') || 'guppy_user';
    cfg.displayName = e.getAttribute('data-display-name') || 'Guppy User';
    cfg.password = e.getAttribute('data-password');
    cfg.autoconnect = e.getAttribute('data-autoconnect');
    if (cfg.autoconnect === 'true') {
      cfg.autoconnect = true;
    } else {
      cfg.autoconnect = false;
    }
    if ((typeof cfg.password === 'string') && (cfg.password === '')) {
      cfg.password = undefined;
    }
    return cfg;
  }

  function getUID(key) {
    var uid = window.localStorage.getItem(key);
    if (!uid) {
      // generate random number
      uid = Math.floor((Math.random()*99999)+10000);
      window.localStorage.setItem(key, uid);
    }
    return uid;
  }

  /**
   * Contructor: Guppy
   *
   * Creates a guppy object complete with sockethub client, and handles all
   * user interface and message passing.
   *
   * Parameters:
   *
   *   e - a single guppy-irc DOM element, containing settings as attributes
   *
   * Returns:
   *
   *   Guppy instance
   */
  var instances = []; // guppy-irc object instances
  var Guppy = function (e) {
    var self = this;
    self.setState('initializing');
    self.config = getGuppyConfig(e);
    self.id = self.config.id;
    self.log_id = app + '#' + self.id;
    self.DOMElements = {};
    self.DOMElements.original = e;

    self.uid = getUID(self.log_id);
    self.config.nick = self.config.nick + '-' + self.uid; // make sure each user is unique

    console.log('NEW GUPPY ' + self.id + ' uid: ' + self.uid + ' :', self.config);

    //
    // after we've connected to sockethub, initIRC handles the credentials and
    // registering of the sockethub irc platform.
    function initIRC(err, sc) {
      // got sockethub client object (sc)
      if (err) {
        self.setError(err);
      } else {
        self.sockethubClient = sc;
      }

      // set our credentials for the sockethub platform
      // (does not activate the IRC session, just stores the data)
      var credentialObject = {};
      self.actor = {
        address: self.config.nick,
        name: self.config.displayName
      };
      credentialObject[self.config.nick] = {
        nick: self.config.nick,
        password: self.config.password,
        server: self.config.server,
        channels: [ self.config.channel ],
        actor: self.actor
      };

      sc.set('irc', {
        credentials: credentialObject
      }).then(function () {
        // successful set credentials
        console.log(self.log_id + ' set credentials!');
        return sc.sendObject({
          verb: 'update',
          platform: 'irc',
          actor: self.actor,
          target: []
        });
      }).then(function () {
        console.log(self.log_id + ' connected to ' + self.config.channel);
        self.DOMElements.textarea.value = self.DOMElements.textarea.value + '\n' +
              ' --- connected to ' + self.config.server + ' on channel ' +
                                     self.config.channel + ' --- ';
        self.setState('connected');
      }, function (err) {
        // error setting credentials
        self.setError(err.message, 'Sockethub Error: ' + err);
      });

      sc.on('message', function (obj) {
        if ((obj.platform === 'irc') &&
            (obj.verb === 'send')) {
          self.displayMessage(obj);
        }
      });
    }

    //
    // decide if we connect to IRC now, or later.
    if (self.config.autoconnect) {
      getSockethubClient(e, initIRC);
    } else {
      // FIXME: wait for 'connect' signal
      // .. then ...
      // getSockethubClient(e, initIRC);
    }

    //
    // do all the ugly DOM stuff.
    self.buildWidget();

    //
    // listen for input submition text
    function onEnterHandler(event) {
      event.which = event.which || event.keyCode;
      if (event.which === 13) {
        console.log('got enter!!', event);
        // send message
        self.sendMessage();
      }
    }
    self.DOMElements.input.addEventListener('keyup', onEnterHandler);

    return this;
  };

  /**
   * Function: displayMessage
   *
   * Writes the message to the textarea box of the guppy widget
   *
   * Parameters:
   *
   *   obj - sockethub activity stream object of verb 'send' and platform 'irc'
   *
   */
  Guppy.prototype.displayMessage = function (obj) {
    var message = obj.actor.address + ': ' + obj.object.text;
    this.DOMElements.textarea.value = this.DOMElements.textarea.value + '\n' + message;
  };

  /**
   * Function: sendMessage
   *
   * Sends a message to Sockethub's IRC platform, and displays it in the textarea
   * console when successful.
   *
   * The message is automatically fetched from the input field.
   *
   */
  Guppy.prototype.sendMessage = function () {
    var self = this;
    var message = self.DOMElements.input.value;
    if (!message) {
      return false;
    }

    console.log('sending '+message);
    self.sockethubClient.sendObject({
      verb: 'send',
      platform: 'irc',
      actor: self.actor,
      target: [{
        address: self.config.channel
      }],
      object: {
        text: message
      }
    }).then(function () {
      // completed
      // add name to message output
      console.log('success');
      message = self.actor.address + ': ' + message;
      self.DOMElements.textarea.value = self.DOMElements.textarea.value + '\n' + message;
      self.DOMElements.input.value = '';
    }, function (err) {
      // error
      self.setError(err.message, err);
    });
  };

  /**
   * Function: setError
   *
   * Handles logging the error and setting the objects state.
   *
   * Parameters:
   *
   *   err - error message
   *   obj - option error object, if applicable
   *
   */
  Guppy.prototype.setError = function (err, obj) {
    if (typeof obj === 'object') {
      console.log(this.log_id + ' ERROR: ' + this.errMsg, obj);
    } else {
      console.log(this.log_id + ' ERROR: ' + this.errMsg);
    }
    self.DOMElements.textarea.value = self.DOMElements.textarea.value + '\n' +
              ' --- Guppy ERROR: ' + errMsg + ' --- ';
    this.errMsg = err;
    this.setState('error');
  };

  /**
   * Function: setState
   *
   * Handles setting and emitting the objects state.
   *
   * Parameters:
   *
   *   state - string describing state. valid strings:
   *           'initializing', 'error', 'connected', 'disconnected'
   *
   */
  Guppy.prototype.setState = function (state) {
    // FIXME: switch to emitters
    this.state = state;
  };

  /**
   * Function: buildWidget
   *
   * Handles all of the DOM drawing of elements withing the Guppy widget.
   * Textarea, input, send button, connection info, etc.
   *
   */
  Guppy.prototype.buildWidget = function () {
    var e = this.DOMElements.original;

    // encapsulating container
    var container = document.createElement('div');
    container.className = 'guppy-irc-container guppy-irc-' + this.config.id + '-container';

    // title of widget
    var title = document.createElement('h1');
    title.className = 'guppy-irc-title guppy-irc-' + this.config.id + '-title';
    title.innerHTML = this.config.title;
    var titleContainer = document.createElement('div');
    titleContainer.className = 'guppy-irc-title-container guppy-irc-' + this.config.id + '-title-container';
    titleContainer.appendChild(title);
    container.appendChild(titleContainer); // put inside container

    // connection information
    var infoContainer = document.createElement('div');
    infoContainer.className = 'guppy-irc-info-container guppy-irc-info-' + this.config.id + '-container';
    container.appendChild(infoContainer);

    // textarea
    var textarea = document.createElement('textarea');
    textarea.className = 'guppy-irc-textarea guppy-irc-' + this.config.id + '-textarea';
    textarea.name = 'guppy-irc-' + this.config.id;
    textarea.cols = this.config.width;
    textarea.rows = this.config.height;
    textarea.wrap = 'soft';
    textarea.maxlength = 0;
    textarea.readonly = 'readonly';
    var textareaContainer = document.createElement('div');
    textareaContainer.className = 'guppy-irc-textarea-container guppy-irc-' + this.config.id + '-textarea-container';
    textareaContainer.appendChild(textarea);
    container.appendChild(textareaContainer);

    // input
    var input = document.createElement('input');
    input.className = 'guppy-irc-input guppy-irc-' + this.config.id + '-input';
    var inputContainer = document.createElement('div');
    inputContainer.className = 'guppy-irc-input-container guppy-irc-' + this.config.id + '-input-container';
    inputContainer.appendChild(input);

    // submit button
    var submit = document.createElement('input');
    submit.className = 'guppy-irc-submit-button guppy-irc-' + this.config.id + '-submit-button';
    submit.type = 'submit';
    submit.name = 'Send';
    submit.value = 'Send';
    submit.id = 'guppy-irc-' + this.config.id + '-submit-button';
    var submitContainer = document.createElement('div');
    submitContainer.className = 'guppy-irc-submit-button-container guppy-irc-' + this.config.id + '-submit-button-container';
    submitContainer.appendChild(submit);

    // controls - contain input and submit button
    var controlsContainer = document.createElement('div');
    controlsContainer.className = 'guppy-irc-controls-container guppy-irc-' + this.config.id + '-controls-container';
    controlsContainer.appendChild(inputContainer);
    controlsContainer.appendChild(submitContainer);
    container.appendChild(controlsContainer);

    this.DOMElements.widget = container;
    this.DOMElements.textarea = textarea;
    this.DOMElements.input = input;
    this.DOMElements.submit = submit;
    document.body.appendChild(container);
  };

  var tags = document.getElementsByTagName('guppy-irc');
  console.log('Guppy tags: ' + typeof tags, tags);
  // foreach tag we create a separate object instance, this way multiple embeds
  // are supported on the same page.
  for (var i = 0, len = tags.length; i < len; i = i + 1) {
    try {
      instances.push(new Guppy(tags[i]));
    } catch (e) {
      console.log(app + ' ERROR: ' + e);
    }
  }

})(window);