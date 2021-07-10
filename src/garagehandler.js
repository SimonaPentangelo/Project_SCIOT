const amqp = require("amqplib");
require("dotenv").config({ path: ".env" });
var nodemailer = require('nodemailer');
var safe = -1;

connectAndWait();
connectAndWait_Two();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'progettosciot@gmail.com',
      pass: 'dbvqvoaydifcxprp'
    }
  });

function sendMsg(result) {
  var mailOptions = {
    from: 'progettosciot@gmail.com',
    to: 'gaetanocasillo@live.it',
    subject: 'Garage Handler Message',
    text: result
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function responseGenerator(val) {
  var garage = parseInt(val.slice(0, 1));
  var someone = parseInt(val.toString().slice(1, 2));
  
  if(someone == 2 && garage == 0) {
    return "The garage is open 🔓, I'm not able to know if there's someone in my path, I can't close it. ⚠️";
  } else if(garage == 1) {
    return "The garage is closed 🔒, I'll open it for you. 🔓";
  } else if(garage == 0 && someone == 1) {
    return "The garage is open 🔓, I can't close it, there's someone in my path... 🧍‍♂️";
  } else if(garage == 0 && someone == 0) {
    return "The garage is open 🔓, I'll close it for you. 🔒";
  }
}

function connectAndWait_Two() {
  amqp
    .connect(`amqp://guest:guest@${process.env.MY_IP}:5672`)
    .then(function (conn) {
      return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue("iot/safety", { durable: false });

        ok = ok.then(function (_qok) {
          return ch.consume(
            "iot/safety",
            function (msg) {
              console.log("Second sensor result: " + msg.content.toString());
              safe = msg.content.toString();
            },
            { noAck: true }
          );
        });

        return ok.then(function (_consumeOk) {
          console.log("*** Second Sensor: ON ***");
        });
      });
    })
    .catch(console.warn);
}

function connectAndWait() {
  amqp
    .connect(`amqp://guest:guest@${process.env.MY_IP}:5672`)
    .then(function (conn) {
      return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue("iot/garagedoor", { durable: false });
        ok = ok.then(function (_qok) {
          return ch.consume(
            "iot/garagedoor",
            function (msg) {
              console.log("First sensor result: " + msg.content.toString());
              result = "*** This is an auto-generated message ***\n\n" +
                        "Hi! I'm the garage handler!⚙️\n"; 
              console.log("Valore safety: " + safe);
              if(safe == -1) {
                safe = 2
              }
              var s = msg.content.toString().concat(safe.toString());
              result += responseGenerator(s);
              console.log(result);
              sendMsg(result);
              safe = -1;
            },
            { noAck: true }
          );
        });

        return ok.then(function (_consumeOk) {
          console.log("*** First Sensor: ON ***");
        });
      });
    })
    .catch(console.warn);
}