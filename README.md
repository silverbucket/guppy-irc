guppy-irc
=========

A tiny embeddable IRC client, using the open-source [sockethub service](http://sockethub.org).

use
===

To use guppy-irc you must include a few `.js` files and define the guppy widget:

  ...
  <guppy-irc id="myGuppy"
             data-title="Welcome to Guppy IRC"
             data-width="80"
             data-height="28"
             data-server="*[irc server hostname]*"
             data-channel="*[#irc_channel]*"
             data-nick="guppy_user"
             data-display-name="Guppy Example User"
             data-password=""
             data-sockethub-host="*[sockethub hostname]*"
             data-sockethub-port="*[port number]*"
             data-sockethub-tls="*[true | false]*"
             data-sockethub-path="*[/path]*"
             data-sockethub-secret="*[connect string]*" />

  ...
  <script src="sockethub-client/sockethub-client.js"></script>
  <script src="../src/js/guppy-irc.js"></script>
  ...

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