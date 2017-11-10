var zmq = require('zmq');
var router = zmq.socket('router');

// Routers are asynchronous and bidirectional. They can be paired with any
// kind of socket
// Routers have a special ability which is telling the identity of the sockets
// they send to/receive from, and they can use it to communicate with them
//
// Keep in mind that all the sockets have a property called 'identity'
// We can set the identity using
// socket_variable.identity = 'Put your ID here';
// If you don't set one, a random ID will be generated automatically
//
// In this particular case, we'll create a requester that will send a message to
// our router. We'll answer back a message and then finish both programs.

router.bind('tcp://127.0.0.1:8888');


// Any message comming to a router will have a different structure:
// arguments[0] (the first segment) will have the ID of the sender
// arguments[1] (the second segment) can be one of these:
//          -The empty char "", if it comes from a rep/req
//          -The queue name, if it comes from a publisher
//          -The real message, if it comes from any socket without formatted
//           messages
//
// If its one of the first two cases, arguments[2] will have the message
// Keep in mind that if the body of the message takes more than one segment,
// it will come in arguments[3], [4] and so on

// We're waiting for a message from a req
// arguments[0] will have the ID of the sender. We'll use it later
// arguments[1] will hold an empty char
// arguments[2] will contain the message

router.on('message', function(){
  // As we're using a concatenation, a .toString() is not required
  console.log("Requester " + arguments[0] + " has sent: " + arguments[2]);

  // In order to answer the requester, we'll craft a message with the following
  // schema
  //
  // The position [0] of the array will hold the ID of the sender
  // The position [1] of the array can be one of these:
  //          -The empty char "", if we're sending to a rep/req
  //          -The queue name, if we're implementing a fake publisher
  //          -The real message, if we're sending to socket without formatted
  //           messages
  //
  // Just like in the reception, if its one of the first two cases,
  // position [2] will hold the message
  // If it's the third case or the message takes more than one segment, it will
  // be included from the position [2] onwards

  // We are sending to a req, so we'll use an empty char
  // arguments[0] has the ID of the sender. It will be like its address
  router.send([arguments[0], "", "Hey, I'm a fake replier!"]);

  // We'll exit after sending the message
  process.exit(0);
})
