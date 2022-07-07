const express = require('express');
const kafka = require('kafka-node');
const sequelize = require('sequelize');

const app = express();
app.use(express.json());

const db = new sequelize(process.env.POSTGRES_URL);
const User = db.define('user', {
    name: sequelize.STRING,
    email: sequelize.STRING,
    password: sequelize.STRING
});

const client = new kafka.KafkaClient({kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS});
const producer = new kafka.Producer(client);
producer.on('ready', () => {
    console.log('producer ready');
    app.post('/', (req, res) => {
        producer.send([{
            topic: process.env.KAFKA_TOPIC, 
            messages: JSON.stringify(req.body)}], (err, data) => {
            if(err) console.log(err);
            else console.log(data);
        })
    });
})


app.listen(process.env.PORT);