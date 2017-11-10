var zmq = require('zmq');
var req = zmq.socket('req');

// We'll set and ID for the requester. It is not mandatory, but it may be useful
req.identity = 'Patata';
// Quite a witty name, don't you think?
// Remember that you should set the ID before connecting
req.connect('tcp://127.0.0.1:8888');

// We don't have to worry about formatting the message, as the server is already
// doing that for us. To put it into perspective, we're connecting to what looks
// like a real replier, so we'll do a normal message
req.send("Hey, I'm a real requester!");

// Same for the reception of the message, it comes from a "real" replier
// In this case, it will just have one segment
req.on('message', function(msg){
  console.log('Replier said: ' + msg);
  // We'll exit after receiving the message
  process.exit(0);
})
