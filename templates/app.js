/**
 * Module dependencies.
 */
const fs = require("fs")
const path = require("path")

/**
 * Include all subscriber domain methods to Kafka Consumers
 */
fs.readdir(path.resolve(__dirname, "..", "domain"), (err, consumers) => {
    consumers.map(file => {
        DomainConsumer = require(path.resolve(__dirname, "..", "domain", file, 'consumer'))
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