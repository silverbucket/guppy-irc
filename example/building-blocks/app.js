(function (window, undefined) {
  var document = window.document;

  var EventUtil = {
    addHandler: function (element, type, handler) {
      if (element.addEventListener) {
        element.addEventListener(type, handler, false);
      } else if (element.attachEvent) {
        element.attachEvent('on' + type, handler);
      } else {
        element['on' + type] = handler;
      }
    },
    removeHandler: function (element, type, handler) {
      if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
      } else if (element.detachEvent) {
        element.detachEvent('on' + type, handler);
      } else {
        element['on' + type] = null;
      }
    }
  };

  var body = document.getElementsByTagName('body');

  function handleView(id, show) {
    var elem = document.getElementById(id);
    if (!elem) {
      console.log("ERROR: cannot show view for "+id);
    }

    var transitionShow, transitionHide;
    if ((elem.classList.contains('move-down')) || (elem.classList.contains('move-up'))) {
      transitionShow = 'move-up';
      transitionHide = 'move-down';
    } else {
      transitionShow = 'slide-left';
      transitionHide = 'slide-right';
    }

    if (show) {
      console.log('Showing: ' + id + ' with ' + transitionShow);
      // show
      elem.classList.remove(transitionHide);
      elem.classList.add(transitionShow);
    } else {
      console.log('Hiding: '+id+' with '+transitionHide);
      // hide
      elem.classList.remove(transitionShow);
      elem.classList.add(transitionHide);
    }
  }

  function clickHandler(event) {
    //console.log('event.target.id: ['+event.target.id+']');
    //console.log("EVENT", event);
    if (!event.target.id) {
      return false;
    }

    switch (event.target.id) {
      case 'room-show':
        handleView('room-view', true);
        break;
      case 'room-hide':
        handleView('room-view', false);
        break;
      case 'join-room-show':
        handleView('join-room-view', true);
        break;
      case 'join-room-hide':
        handleView('join-room-view', false);
        break;
      case 'nickname-change-show':
        handleView('nickname-change-view', true);
        break;
      case 'nickname-change-hide':
        handleView('nickname-change-view', false);
        break;
      case 'user-list-show':
        handleView('user-list-view', true);
        break;
      case 'user-list-hide':
        handleView('user-list-view', false);
        break;
      case 'leave-room':
        console.log('leaveRoom() NOT IMPLEMENTED');
        //handleView('');
        break;
      default:
        console.log('unknown action '+event.target.id);
        break;
    }
  }

  EventUtil.addHandler(body[0], 'click', clickHandler);




  // guppyIRC.create({
  //   id: "GuppyApp#sockethub",
  //   title: "",
  //   server: "irc.freenode.net",
  //   channel: "#sockethub",
  //   nick: "guppy",
  //   renderWidget: "false",
  //   enableHistory: "true",
  //   displayName: "Guppy IRC User",
  //   password: "",
  //   autoconnect: "true",
  //   sockethub: {
  //     host: "localhost",
  //     port: "10550",
  //     tls: "false",
  //     path: "/sockethub",
  //     secret: "1234567890"
  //   }
  // });

})(window);
