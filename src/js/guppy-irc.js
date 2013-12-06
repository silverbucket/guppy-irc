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
    cfg.width = e.getAttribute('data-width');
    cfg.height = e.getAttribute('data-height');
    cfg.server = e.getAttribute('data-server') || 'irc.freenode.net';
    cfg.channel = e.getAttribute('data-channel') || '#sockethub';
    cfg.nick = e.getAttribute('data-nick') || 'guppy_user';
    cfg.displayName = e.getAttribute('data-display-name') || 'Guppy User';
    cfg.password = e.getAttribute('data-password');
    if ((typeof cfg.password === 'string') && (cfg.password === '')) {
      cfg.password = undefined;
    }
    return cfg;
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
    self.id = e.id;
    self.log_id = app + '#' + self.id;
    self.setState('initializing');

    var cfg = getGuppyConfig(e);

    console.log('NEW GUPPY ' + self.id + ':', cfg);

    getSockethubClient(e, function (err, sc) {
      // got sockethub client object (sc)
      if (err) {
        self.setError(err);
      } else {
        self.sockethubClient = sc;
      }

      // set our credentials for the sockethub platform
      // (does not activate the IRC session, just stores the data)
      var credentialObject = {};
      credentialObject[cfg.nick] = {
        nick: cfg.nick,
        password: cfg.password,
        server: cfg.server,
        channels: [ cfg.channel ],
        actor: {
          address: cfg.nick,
          name: cfg.displayName
        }
      };

      sc.set('irc', {
        credentials: credentialObject
      }).then(function () {
        // successful set credentials
        console.log(self.log_id + ' set credentials!');
        self.setState('connected');
      }, function (err) {
        // error setting credentials
        self.setError(err.message, 'Sockethub Error: ' + err);
      });

    });

    return this;
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


  var tags = document.getElementsByTagName('guppy-irc');
  console.log('Guppy tags: '+typeof tags, tags);
  // foreach tag we create a separate object instance, this way multiple embeds
  // are supported on the same page.
  for (var i = 0, len = tags.length; i < len; i = i + 1) {
    try {
      instances.push(new Guppy(tags[i]));
    } catch (e) {
      console.log(app + ' ERROR: '+e);
    }
  }

})(window);