guppy-irc
=========

A tiny embeddable IRC client, using the open-source [sockethub service](http://sockethub.org).

use
===

To use guppy-irc you must include a few `.js` files, a `.css` file, and define the guppy-irc widget:

```html
  <link rel="stylesheet" href="../src/css/guppy-irc.css" />
  ...
  <guppy-irc id="myGuppy"
             data-title="Welcome to Guppy IRC"
             data-width="80"
             data-height="28"
             data-server="<irc_server>"
             data-channel="*<#irc_channel>"
             data-nick="guppy_user"
             data-display-name="Guppy Example User"
             data-password=""
             data-sockethub-host="<sockethub_hostname>"
             data-sockethub-port="<port_number>"
             data-sockethub-tls="<true|false>"
             data-sockethub-path="*<uri_path>"
             data-sockethub-secret="<register_string>" />
  ...
  <script src="sockethub-client.js"></script>
  <script src="guppy-irc.js"></script>
```

dependencies
============

Guppy IRC uses Sockethub for IRC connectivity, and therefore has the following
dependencies:

* [sockethub-client.js](http://github.com/sockethub/sockethub-client)

* A running [Sockethub](http://github.com/sockethub/sockethub) instance.


example
=======

To get the Guppy IRC example up and running, do the following.

    $ git clone https://github.com/silverbucket/guppy-irc.git
    $ cd guppy-irc
    $ git submodule update --init
    $ python -M SimpleHTTPServer 8000

Then browse to `localhost:8000/example`, you should see the example load in your
browser.
