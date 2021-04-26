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
        DomainConsumer = require(path.resolve(__dirname, "..", "domain", subdomain, 'Consumer'))
        DomainConsumer.subscribe()
    });
})

/**
 * Connect all Kafka Consumers to your Topics
 */
fs.readdir(path.join(__dirname, "consumers"), (err, consumers) => {
    consumers.map(file => {
        Consumer = require(path.join(__dirname, "consumers", file))
        Consumer.init()
    });
})

module.exports = kafka
