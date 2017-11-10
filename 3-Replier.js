var zmq = require('zmq');
var rep = zmq.socket('rep');

rep.bind('tcp://127.0.0.1:8888');

// Check out how our incomming message will only have one argument (msg)
// This happens because the first segment, the empty message "", is discarded when
// we receive it - It's automatic as we're using a real rep
rep.on('message', function(msg){
  console.log('Received: ' + msg);
  // Until here it's a regular replier. However, keep in mind that if we just
  // left this as it is, the program will not work further than the first message
  //
  // Repliers MUST answer in order to continue its execution. Otherwise,
  // they will become locked. As so, we'll add a response right after receiving
  // any message
  rep.send("Hello, I'm a real Replier");
  // Notice how we don't have to set the empty char "" at the message
  // It is performed automatically for us because we're using a real rep
})
