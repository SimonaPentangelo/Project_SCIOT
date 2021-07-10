const amqp = require("amqplib");
require("dotenv").config({ path: ".env" });
var nodemailer = require('nodemailer');

connectAndWait();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'giuseppe9909@gmail.com',
      pass: 'vrkctbdhunaccnwa'
    }
  });

function sendMsg(result) {
  var mailOptions = {
    from: 'giuseppe9909@gmail.com',
    to: 'fabulart99@gmail.com',
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

  if(garage == 1) {
    return "The garage is closed, I'll open it for you.";
  } else if(garage == 0 && someone == 1) {
    return "The garage is open, I can't close it, there's someone in my path...";
  } else if(garage == 0 && someone == 0) {
    return "The garage is open, I'll close it for you.";
  }
}

function connectAndWait() {
  amqp
    .connect(`amqp://guest:guest@${process.env.MY_IP}:5672`)
    .then(function (conn) {
      return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue("iot/alerts", { durable: false });

        ok = ok.then(function (_qok) {
          return ch.consume(
            "iot/alerts",
            function (msg) {
              console.log(msg.content.toString());
              //var result = responseGenerator(msg.content.toString());
              //sendMsg(result);
            },
            { noAck: true }
          );
        });

        return ok.then(function (_consumeOk) {
          console.log("*** Service status: ON ***");
        });
      });
    })
    .catch(console.warn);
}