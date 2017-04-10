"use strict";

import * as amqp from "amqplib";
import {EventEmitter} from "events";

export class RabbitMQ extends EventEmitter {

  constructor(rabbitConfig) {

    super();

    if (!rabbitConfig || !rabbitConfig.url) {
      throw new Error("Missing RabbitMq Dependencies");
    }

    /** @member {string} config for rabbit mq. */
    this.rabbitConfig_ = rabbitConfig;

    /** @member {string} url to connect with rabbit mq. */
    this.connectionUrl_ = rabbitConfig.url;

    /** @member {string} url to connect with rabbit mq. */
    this.connection_ = null;

    /** @member {string} url to connect with rabbit mq. */
    this.channel_ = null;

    /** @member {string} url to connect with rabbit mq. */
    this.connectionOptions_ = rabbitConfig.options || {};

    this.queueOptions_ = {
      "durable": true,
      "autoDelete": false,
      "arguments": {
        "x-message-ttl": 24 * 60 * 60 * 1000,
        "maxLength": 1000,
        "x-dead-letter-exchange": "deadLetter-generic"
      }
    };

    this.exchangeOptions_ = {
      "durable": true,
      "autoDelete": false,
      "alternateExchange": "",
      "arguments": {}
    };
  }

    connect() {
      this.connection_ = this.connection_ || amqp.connect(this.connectionUrl_, this.connectionOptions_);
      console.log(`${RabbitMQ.name}.connect(), Creating New Connection ===> `);
      return this.connection_;
    }

    createChannel() {

      this.channel_ = this.channel_ ||
        this.connect()
          .then(conn => {
            console.log(`${RabbitMQ.name}.createChannel(), Creating New Channel ==> `);
            return conn.createChannel();
          })
          .catch(err => {
            console.error("Error in creating RabbitMQ Channel ", err);
          });

      return this.channel_;
    }

    publish(message, queue = null) {

      let {queueName, exchangeName, exchangeType} = this.rabbitConfig_,
        queueOptions = Object.assign({}, this.queueOptions_);

      queueName = queue || queueName;
      exchangeName = `${queueName}-exchange`;

      return this.createChannel()
        .then(channel => {
          console.log(`${RabbitMQ.name}.publish(): Publishing the message in queue: ${queueName} `);

          channel.assertExchange(exchangeName, exchangeType, this.exchangeOptions_);

          return channel.assertQueue(queueName, queueOptions)
            .then(queueRes => {
              channel.bindQueue(queueRes.queue, exchangeName, queueRes.queue);

              channel.publish(exchangeName, queueRes.queue, new Buffer(message));
              console.log(" [x] Sent %s", message);
            });
        })
        .catch(err => {
          console.error("Error in publishing the message", err);
          this.connection_ = null;
          this.channel_ = null;
          this.emit("error", err);
        });
    }

    consume(queue = null) {

      let {queueName, exchangeName, exchangeType} = this.rabbitConfig_,
        queueOptions = Object.assign({}, this.queueOptions_);

      queueName = queue || queueName;
      exchangeName = `${queueName}-cantahealth`;

      return this.createChannel()
        .then(channel => {

          console.log(`${RabbitMQ.name}.consume(): Consuming the message from queue: ${queueName} `);

          console.log(`${RabbitMQ.name}.setChannelPrefetch(): Initializing channel prefetch ==> `);
          channel.prefetch(this.rabbitConfig_.prefetchCount, false);
          console.log("Prefetch count: %s successfully set for channel: ", this.rabbitConfig_.prefetchCount);

          channel.assertExchange(exchangeName, exchangeType, this.exchangeOptions_);

          return channel.assertQueue(queueName, queueOptions)
            .then(queueRes => {

              channel.bindQueue(queueRes.queue, exchangeName, queueRes.queue);

              channel.consume(queueRes.queue, msg => {
                console.log("Consuming Message...", msg.content.toString());

                this.emit("msgReceived", msg);

              }, {"noAck": false});

            });
        })
        .catch(err => {
          console.error("Error in consuming the message", err);
          this.connection_ = null;
          this.channel_ = null;
          this.emit("error", err);
        });
    }

    acknowledgeMessage(msg, allUpTo = false) {

      return this.createChannel()
        .then(channel => {
          channel.ack(msg, allUpTo);
          console.log("Message has been acknowledged... ", msg.content.toString());
        })
        .catch(err => {
          console.error("Error in consuming the message", err);
          this.connection_ = null;
          this.channel_ = null;
          this.emit("error", err);
        });
    }

    noAcknowledgeMessage(msg, allUpTo = false, requeue = false) {

      return this.createChannel()
        .then(channel => {
          channel.nack(msg, allUpTo, requeue);
          console.log(`Negative Ack:Message will go to DeadLetterQueue: deadLetter-${this.rabbitConfig_.queueName}`,
              msg.content.toString());
        })
        .catch(err => {
          console.error("Error in No Acknowledgement...", err);
          this.connection_ = null;
          this.channel_ = null;
          this.emit("error", err);
        });
    }
  }
