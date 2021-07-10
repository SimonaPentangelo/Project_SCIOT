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

function test(msg) {
  var mailOptions = {
    from: 'giuseppe9909@gmail.com',
    to: 'fabulart99@gmail.com',
    subject: 'Garage Handler Message',
    text: msg.content.toString()
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
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
              test(msg);
              console.log(msg.content.toString())
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