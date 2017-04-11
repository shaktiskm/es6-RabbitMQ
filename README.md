# es6-RabbitMQ


## Setup

1. Check the npm packages:

    ```
    npm install
    ```

2. Start the application

    ```
    import RabbitMQ from "es6-RabbitMQ";
    
    let rabbitmqConfig = {
        "url": "amqp://guest:guest@127.0.0.1:5672",
        "queueName": "chk-rabbit",
        "exchangeName": "chk-rabbit",
        "exchangeType": "direct",
        "prefetchCount": 1,
        "options": {}
    },
    rabbitmqInstance = new RabbitMQ(rabbitmqConfig);
    ```
    Now you can call it's wrapper methods.

## Managing the project with Grunt

* Runs eslint, babel:dist

    ```
    grunt
    ```

* Compiles the .es6 files to .js
 
    ```
    grunt babel:dist
    ```

* Lints the .es6 files

    ```
    grunt eslint
    ```
