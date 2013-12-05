guppy-irc
=========

A tiny embeddable IRC client, using the open-source [sockethub service](http://sockethub.org).


use
===

To get the Guppy IRC example up and running, do the following.

    $ git clone https://github.com/silverbucket/guppy-irc.git
    $ cd guppy-irc
    $ git submodule update --init
    $ python -M SimpleHTTPServer 8000

Then browse to `localhost:8000/example`, you should see the example load in your
browser.