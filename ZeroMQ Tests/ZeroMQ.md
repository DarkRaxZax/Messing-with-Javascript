# ØMQ

---

## Properties

* In-memory queues are used to store pending outgoing or incoming messages (a.k.a. **weak persistance**)
* Messages can be fragmented into multiple parts. Despite of the size of the segments being limited, an infinite amount of parts can be sent
* Message delivery is **atomic** (all parts are delivered, otherwise none is accepted and the message is discarded)
* Asynchronous communication (except for ``req`` and ``rep`` sockets)

## Sockets

```javascript
// Basic socket creation
var zmq = require('zmq');
var socket = zmq.socket(<socket type>);

// Socket identity
socket.identity = 'Patata';

// Socket binding (performed by one process)
socket.bind('tcp://localhost:25565');

// Socket connection (performed by the other process)
socket.connect('tcp://localhost:25565');
```

Making it simple, the process of binding or connecting socket establishes a "meeting point" for both ends. Once they are linked, messages can be shared between them.

* The binding and the connection can be performed **in any order**. E.g., a subscriber may connect to a publisher that has already been bound to a port and viceversa

* Binding and connecting both sides before the transmission of data is **mandatory** in most cases. However, there are cases where a socket will send data no matter if there's an active socket on the other side.

* A single socket can be **connected to multiple sockets**

* A single socket can be **bound to multiple sockets**

  ​	Keep in mind that the sockets must be bound/connected to another socket of the right type

* Depending on their type, sockets can have **queues** for the messages
  * Pull and Sub have incoming queues
  * Push and Pub have outgoing queues

* Every socket has an **identity** that can be defined **before** binding/connecting using the field ``socket_name.identity``

### Communication

```javascript
// Identical syntax for bindings and connections
socket.bind('tcp://IP or URL:PORT');		// TCP communication
socket.bind('ipc://path_to_socket');		// Inter-process (sockets outside of the program)
socket.bind('inproc://queue_name');			// Intra-process (socket queues inside of the program)
```

### Message sending

The function **sends** accepts Strings. Any argument passed to this function that has a different data type will be casted to a String before being sent*****.

> *****In reality, it will be casted into a String and then to a buffer before being sent. However, after it is received, it can be casted back to a String, so this shouldn't matter in most cases.

```javascript
socket.send('Segment 1', zmq.ZMQ_SNDMORE);		// Send 1 segment & indicate that more will follow
socket.send('Segment 2');						// Send the second and last segment.

// Alternatively, for a large amount of segments 
socket.send(['Segment 1', 'Segment 2', ...]); 	// Send multiple segments in a single instruction
```

### Message reception

ØMQ relies on detecting the reception of a message by means of an event.

```javascript
// If we know the amount of segments we'll receive
socket.on('message', function(first_segment, second_segment){
  console.log('I received ' + first_segment + 'followed by ' + second_segment);
};);

// If the amount of segments is unknown
socket.on('message', function(){
  for(var key in arguments){		// ``arguments`` is the array that holds all the segments
    console.log(arguments[key]);	// We index in ``arguments`` using ``key``
  }
};);
```

---

## Socket types

Socket types were designed to have a matching pair that complements its functionality. Sockets under the same cathegory will make use of the same queues or procedures to communicate.

| Types |      Sender       |      Receiver      |              Communication               |
| :---: | :---------------: | :----------------: | :--------------------------------------: |
| **1** | Requester **req** |  Replier **rep**   | Synchronous, bidirectional (1 Req <==> (1..N) Rep) |
| **2** |  **push** socket  |  **pull** socket   | Asychronous, unidirectional (1 Push ==> (1..N) Pull) |
| **3** | Publisher **pub** | Subscriber **sub** | Asynchronous, unidirectional (1 Pub ==> (1..N) Sub queues) |

### REQUESTER / REPLIER

* A **requester``req``** can be connected to **one or many repliers ``rep``**

* Any message received by a replier will be **fairly enqueued** (using FIFO)

* When a requester performs multiple **send()**, the messages (NOT THE SEGMENTS) will be split among all the repliers it is connected to in **round robin**

* When sending a message, the requester prepends an empty char ``""`` to the content that it is about to be sent. Once the replier receives it, it will delete this character and leave the rest of the message untouched. This procedure is **automatic**, but we should take it into account later on.

  In other words, you can just ignore it if you're not messing with router sockets as this implementation already has this behaviour in mind.

* The **``req``** connects, the **``rep``** binds

> **IMPORTANT:** After sending a message, a requester will wait for a **response from the replier** it was meant to reach. Until then, it won't send messages. If it does not receive a response it may become blocked, leading to unvoluntary locks.

```javascript
// Requester
var zmq = require('zmq');
var req = zmq.socket('req');

req.connect('tcp://127.0.0.1:8888');
req.connect('tcp://127.0.0.1:8889');
req.send('Hello');
req.send('Hello again');
req.on('message', function(msg){
  console.log('Response: ' + msg);
});

// The output would be:
// Response: World
// Response: World 2
```

```javascript
// Replier 1
var zmq = require('zmq');
var rep = zmq.socket('rep');

rep.bind('tcp://127.0.0.1:8888');
rep.on('message', function(msg){
  console.log('Request :' + msg);
  rep.send('World');
});

// The output would be:
// Request: Hello
```

```javascript
// Replier 2
var zmq = require('zmq');
var rep = zmq.socket('rep');

rep.bind('tcp://127.0.0.1:8889');
rep.on('message', function(msg){
  console.log('Request :' + msg);
  rep.send('World 2');
});
// The output would be:
// Request: Hello again
```

Once again, remember that this happens because the requester will send the messages to the repliers it is connected to in **round robin**.

---

### PUSH / PULL

- A **``push`` socket** can be connected to **one or many ``pull`` sockets**
- Any message received by a ```pull``` will be **fairly enqueued** (using FIFO)
- When a ``push`` performs multiple **send()**, the messages (NOT THE SEGMENTS) will be split among all the ``pull`` it is connected to in **round robin**
- The **``push``** binds, the **``pull``** connects

> **IMPORTANT:** A push can constantly send messages, **it doesn't have to wait**. Obviously, it won't wait for an answer

```javascript
// Push socket
var zmq = require('zmq');
var push = zmq.socket('push');
var count = 0;

push.bind('tcp://127.0.0.1;8888');
setInterval(function(){
  push.send("Msg number " + count++);
}, 1000);
```

```javascript
// Pull socket
var zmq = require('zmq');
var pull = zmq.socket('pull');

pull.connect('tcp://127.0.0.1;8888');
pull.on('message', function(msg){
  console.log('Received ' + msg);
});

// The output would be:
// Received 0
// Received 1
// Received 2 (and so on)
```

---

### PUBLISHER / SUBSCRIBER

Given the nature of its implementation, this pair of sockets will make use of a **named queue** to send and receive messages.

- A publisher **``pub`` ** will send a message to a queue. The **first segment** will be the name of the queue
- Subscribers **``sub``** **must subscribe to a queue** using the method **``subscribe(queue_name)``**, and they will only receive messages that are sent to that queue
- The same queue can be used by an infinite amount of subscribers, and all of them will receive the same message
- A ``pub`` can send to **several queues**, that is, to several subscribers at different queues at the same time
- Messages are sent to the subscibers no matter if they are alive or not (like a UDP datagram)
- The **``pub``** binds, the **``sub``** connects

>**IMPORTANT**: The first segment of the message will indicate the queue, and the remaining segments are what's going to be used in the program.
>
>In other words, the first segment is an "envelope" that indicates the destination queue. The real, useful content of the message comes from the second segment onwards.

Please note the behaviour of the segment ``QUEUE_NAME`` in the publisher, as well as the ``sub.subscribe`` in the subscriber.

```javascript
// Publisher code
var zmq = require('zmq');
var pub = zmq.socket('pub');
var count = 0;

pub.bind("tcp://127.0.0.1:8888");
setInterval(function(){
  pub.send('QUEUE_NAME' + "Message #" + count++);
}, 1000);
```

```javascript
// Subscriber code
var zmq = require('zmq');
var sub = zmq.socket('sub');

sub.connect('tcp://127.0.0.1:8888');
sub.subscribe('QUEUE_NAME');
sub.on("message", function(msg){
  console.log('Received ' + msg);
});

// The output would be:
// Received QUEUE_NAMEMessage #0
// Received QUEUE_NAMEMessage #1
// Received QUEUE_NAMEMessage #2 (and so on)
```

In cases like this one, the first part of the string (``queue_name``) will not be useful for us when we receive it. In order to avoid it, we could use the length of the queue name to slice the received message:

```javascript
sub.on("message", function(msg){
  // By deleting the first queue_name.lenght characters
  // we avoid the queue name entirely.
  msg = msg.slice(queue_name.length, msg.length);
  console.log('Received ' + msg);
});

// The output would be:
// Received Message #0
// Received Message #1
// Received Message #2 (and so on)
```

If we swapped the ``queue_name`` in the publisher's code, the subscriber will receive nothing as all the messages would be sent to a different queue.

We can have a publisher that publishes to two or more queues at the same time, such as this one:

```javascript
// Publishing to two queues
var zmq = require('zmq');
var pub = zmq.socket('pub');
var counter = 0;

pub.bind('tcp://127.0.0.1:8888');

setInterval(function(){
  pub.send('QUEUE_A' + "Message #" + count);
  pub.send('QUEUE_B' + "Message #" + count);
  count++;
}, 1000);
```

---

###  DEALER / ROUTER

The **``dealer``** and the **``router``** are the asynchronous version of the **requester** and the **replier**, respectively. However, a router is bidirectional and can distinguish its connections based on the ``identity`` field of the socket it is connected/bound to.

Routers can be used to connect to any of the sockets explained above, including dealers and routers. However, when doing so, messages should be crafted according to the properties of the sender and the receiver (e.g., the queue when sending to a ``sub`` or the empty char when sending to a ``rep``).

The ``dealer`` has an outgoing queue, whereas the ``router`` has both an incoming and an outgoing queue.

---

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>

[Raúl P. B. - 2017]

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.