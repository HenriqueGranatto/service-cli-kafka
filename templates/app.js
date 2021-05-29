/**
 * Module dependencies.
 */
 require('dotenv').config()
const fs = require("fs")
const path = require("path")
const { Kafka } = require('kafkajs')

/**
 * Start connection with Kafka Servers 
 */
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS.split(";")
})

/**
 * Include all subscriber domain methods to Kafka Consumers
 */
fs.readdir(path.resolve(__dirname, "..", "domain"), (err, consumers) => {
    consumers.map(subdomain => {
        const file = path.resolve(__dirname, "..", "domain", subdomain, 'Consumer')

        if(fs.existsSync(file))
        {
            DomainConsumer = require(file)
            DomainConsumer.subscribe()
        }
    });
})

/**
 * Connect all Kafka Consumers to your Topics
 */
fs.readdir(path.join(__dirname, "consumers"), (err, consumers) => {
    consumers.map(subdomain => {
        const file = path.join(__dirname, "consumers", subdomain)

        if(fs.existsSync(file))
        {
            Consumer = require(file)
            Consumer.init()
        }
    });
})

module.exports = kafka
