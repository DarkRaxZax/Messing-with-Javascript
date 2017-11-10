// In this case, we'll build a dealer that will resemble a requester socket
//
// Dealers can connect to ANY kind of socket, but we have to keep in mind the
// format of the message we'll send to/receive from the destination socket
//
// Different from req/rep, dealers are asynchronous, so we won't have to wait
// until we receive a response. Also, it won't block the execution
//
// As we already know, both req and rep sockets make use of an empty char ""
// that is prepended to the message we'll send
// Obviously, a regular req/rep will hide that from us. We'll see that in its
// pair replier

var zmq = require('zmq');
var dealer = zmq.socket('dealer');

// As we're faking a req, we'll have to perform a bind
// Remember that dealers can bind or connect depending on the implementation
dealer.connect('tcp://127.0.0.1:8888');

// Let's craft the message. We'll send a simple message every second with an
// identifier

var counter = 0;

setInterval(function(){
  dealer.send(["", "I'm a fake Requester - Message #" + counter++]);
  // Just for the sake of testing, we'll put a message that does not have
  // a proper format.
  // SPOILER: It won't be received as it won't have a "" as its first segment
  dealer.send("I have a wrong format!");
},1000);

// Please check the Replier implementation before continuing
// Check it. Do it NOW.
//
//
// Did you? Good boy! Have a treat. Let's move on
//
// I want you to make an effort and remember the key aspect about dealers
// Yes, they are ASYNCHRONOUS, they won't wait for an answer like a req does
// If they were imitating a rep, they wouldn't have to answer after
// receiving a message
//
// Given that, we could just stop here, but we may want to receive whatever
// the replier is sending back to us. Who knows, maybe it's useful

dealer.on('message', function(){
  // Remember: arguments[0] will hold the "" space, it won't be cleared
  // automatically for us as we are not in a real req
  //
  // arguments[1] has the message we want, just remember to do a .toString()
  // as it'll come as a buffer
  console.log(arguments[1].toString());

  // Oh, it's more spam. Whatever, my job here is done
})
