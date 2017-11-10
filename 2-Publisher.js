var zmq = require('zmq');
var pub = zmq.socket('pub');

pub.bind("tcp://127.0.0.1:8888", function(err){
  if(err) throw err;
});

// Simple message sent as an array, formed by two segments:
// - Segment #1 (position 0 in the array), which will ALWAYS be the queue name
// - Segments #2 and onwards (positions 1..n), which are the body of the message
//
// This array could be of any size, just keep in mind that any sent segment has
// to be treated correctly once it reaches the destination
setInterval(function(){
  pub.send(["Potato", "Message for queue Potato"]);
  pub.send(["Colesaw", "Message for queue Colesaw"]);
}, 1000);
