var zmq = require('zmq');
var sub = zmq.socket('sub');
sub.subscribe("Potato");

sub.connect("tcp://127.0.0.1:8888", function(err){
  if(err) throw err;
});

// The function receives a list of 2 segments that are stored in the variable
// arguments[]. The first segment will always be the queue name, whereas the
// n following ones would be the body of the message.
//
// Notice how the subscriber is intelligent enough to understand that the first
// segment represents the queue name.
sub.on('message', function(){
  console.log("Queue name: " + arguments[0] + "; Content: " + arguments[1]);
})
