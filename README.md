guppy-irc
=========

A tiny embeddable IRC client, using the open-source [sockethub service](http://sockethub.org).

use
===

To use guppy-irc you must include a few `.js` files and define the guppy widget:

```html
  <link rel="stylesheet" href="guppy-irc.css" />
  ...
  <guppy-irc id="myGuppy"
             data-title="Welcome to Guppy IRC"
             data-width="640"
             data-height="280"
             data-server="<irc_server>"
             data-channel="<#irc_channel>"
             data-nick="guppy"
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
  ...
```

dependencies
============

Guppy IRC uses Sockethub for IRC connectivity, and therefore has the following
dependencies:

* [sockethub-client.js](http://github.com/sockethub/sockethub-client)

* A running [Sockethub](http://github.com/sockethub/sockethub) instance.

status
======

Guppy IRC currently has basic functionality. You can connect to a channel, and
send/receive messages. The UI still needs lots of love.

Also, the Sockethub IRC platform is still under heavy development, as it becomes
more stable so should Guppy. However right now things appear to be functional
stable at it's basic element, if lacking in features.


example
=======

### live demo

You can try out Guppy IRC, which is connecting to a public sockethub instance
and automatically connects to the #sockethub channel, here:

[http://silverbucket.github.io/guppy-irc/example/](http://silverbucket.github.io/guppy-irc/example/)


### run your own demo

To get the Guppy IRC example up and running, do the following.

    $ git clone https://github.com/silverbucket/guppy-irc.git
    $ cd guppy-irc
    $ git submodule update --init
    $ python -M SimpleHTTPServer 8000

Then browse to `localhost:8000/example`, you should see the example load in your
browser.

css elements
============

The following is a list of all the css elements for a guppy-irc widget. Allowing
you to create your own theme css files.

#### parent container
  `.guppy-irc-container` - parent container of widget contents.


#### title
  `.guppy-irc-title-container` - div containing title
  
  `.guppy-irc-title` - actual title element (an *h1* tag)


#### info
  `.guppy-irc-info` - contains information text *(not used yet)*


#### messages
  `.guppy-irc-messages-container` - container of all messages
  
  `.guppy-irc-message-line` - a single message line
  
  `.guppy-irc-message-nick` - the nick of a message
  
  `.guppy-irc-message-nick-decorator` - the decorator (ie. : separator) of the nick -> text

##### - messages addressed to you
The same assignments as above except only added to elements where the text contains your IRC nick.
  `.guppy-irc-message-line-to-me`
  
  `.guppy-irc-message-nick-to-me`
  
  `.guppy-irc-message-nick-decorator-to-me`
  
  `.guppy-irc-message-nick-to-me`


#### controls
The various inputs, buttons, etc.
  `.guppy-irc-controls-container` - contains all controls

  `.guppy-irc-input-container` - the input container
  
  `.guppy-irc-input` - input form element
  
  `.guppy-irc-submit-button-container` - send buttong container
  
  `.guppy-irc-submit-button` - submit button element *(not functional yet)*

#### system messages
When Guppy needs to speak, it prints out messages in the message container.

  `.guppy-irc-error-line` - line containing error message
  
  `.guppy-irc-status-line` - line containing status message


**NOTE**: Each widget's id tag also serves as it's own namespaced set of CSS
rules, allowing you to stylize multiple consoles on the same page differently.

So, while `.guppy-irc-message-container` applies to any Guppy widget,
`.guppy-irc-myGuppy-message-container` applies only to the Guppy widget
instance with that `id` tag value of `myGuppy`.

