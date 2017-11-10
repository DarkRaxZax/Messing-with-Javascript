var zmq = require('zmq');
var rep = zmq.socket('rep');
var counter = 0;

rep.bind('tcp://127.0.0.1:8888', function(err){
  if(err) throw err;
});

// In order to read correctly this message, we must follow the format in which
// it was sent to the replier. It was formed by two segments:
// -Segment 1: A String containing a message
// -Segment 2: An object formatted in JSON
rep.on('message', function(){
  // Argument one: String (Located in arguments[0])
  // As the segments are sent as Buffers, we have to cast them to Strings
  //
  // IMPORTANT: console.log() WILL NEVER CAST BUFFERS INTO STRINGS
  // The only case where this happens is when we concatenate buffers, as the
  // concatenation will force the casting
  // Example: arguments[0] + "" + arguments[1] will be a String
  console.log(arguments[0].toString());

  // Argument two: Object (Located in arguments[1])
  // As it is sent as a JSON object, we have to do a JSON.parse()
  //
  // Notice how JSON admits the argument[1] even though it is a Buffer
  // This is because some functions can cast into other data types automatically
  // In this case, JSON.parse will do the work for us
  var object = JSON.parse(arguments[1]);

  console.log('Requester sent an object whose arguments are:');
  for (i in object){
    // The properties of the object are like any Javascript variable
    // Therefore they can be read without casting
    console.log(object[i]);
  }

  // Once it finishes reading, we answer the requester
  // In this case, we use a single message as a response. Keep in mind that
  // the format of the message is free, it just depends on how we treat it
  // once it arrives to its destination
  // E.g. The requester sent 2 segments whereas the replier will send just one
  rep.send("[Iteration #" + counter++ + "] Replier: I finished reading. Now you can send me more messages");
})
