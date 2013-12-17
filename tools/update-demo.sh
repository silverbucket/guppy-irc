#!/bin/sh
mkdir -p ../tmp/guppy-irc
cp example/index.html ../tmp/guppy-irc/index.html &&
cp -r logo/ ../tmp/guppy-irc/ &&
cp src/js/guppy-irc.js ../tmp/guppy-irc/guppy-irc.js &&
cp src/css/guppy-irc.css ../tmp/guppy-irc/guppy-irc.css &&
git push &&
git checkout gh-pages &&
cp ../tmp/guppy-irc/index.html example/ &&
cp ../tmp/guppy-irc/guppy-irc.js src/js/ &&
cp ../tmp/guppy-irc/guppy-irc.css src/css/ &&
cp -r ../tmp/guppy-irc/logo . &&
#git add logo/ &&
git commit -m "updating gh-pages demo" . &&
git push origin gh-pages
git checkout master

