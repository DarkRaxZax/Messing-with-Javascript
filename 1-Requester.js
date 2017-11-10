var zmq = require('zmq');
var req = zmq.socket('req');
var counter = 0;

req.connect('tcp://127.0.0.1:8888', function(err){
  if(err) throw err;
});

// Create an object
var object = {
  number: "20",
  color: "Green"
};

// Send the object in two parts: A segment containing the iteration and
// a segment containing the object
setInterval(function(){
  req.send(["[Iteration #" + counter++ + "] Requester", JSON.stringify(object)]);
}, 1000);

req.on("message", function(msg){
  console.log(msg.toString());
})
