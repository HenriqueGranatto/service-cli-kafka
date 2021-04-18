module.exports = (toolbox) =>
{
    toolbox.readTemplate = readTemplate
    toolbox.createModule = createModule
    toolbox.createConsumers = createConsumers
    toolbox.createProducers = createProducers
    toolbox.createDomainConsumers = createDomainConsumers
    toolbox.createDomainProducers = createDomainProducers
}

const readTemplate = async (toolbox, module) =>
{
    toolbox.print.info("- Procurando template")
    module.template.data = toolbox.filesystem.read(module.template.file)

    if(!module.template.data)
    {
        toolbox.print.error(`- Template não encontrado: ${module.template.file}`)
        process.exit(0)
    }

    toolbox.print.success("- Template encontrado")
    module.template.data = JSON.parse(module.template.data)

    const consumers = module.template.data.consumers
    const producers = module.template.data.producers

    return {consumers, producers}
}

const createModule = async (toolbox) =>
{
    toolbox.print.success("- Adicionando: kafka/app.js")
    await toolbox.template.generate({
        template: 'app.js',
        target: `kafka/app.js`,
    })

    toolbox.print.success("- Adicionando: kafka/server.js")
    await toolbox.template.generate({
        template: 'server.js',
        target: `kafka/server.js`,
    })

    toolbox.print.success("- Adicionando diretório: /consumers")
    await toolbox.filesystem.dir('kafka/consumers')

    toolbox.print.success("- Adicionando diretório: /producers")
    await toolbox.filesystem.dir('kafka/producers')

    toolbox.print.success("- Adicionando: configurações do módulo no arquivo .env")
    let env = `# Configurações do Kafka\n`
    env += `KAFKA_CLIENT_ID=\n`
    env += `KAFKA_BROKERS=`
    toolbox.filesystem.append('.env', env)

    toolbox.print.success("- Adicionando: módulo no arquivo service.js")
    toolbox.filesystem.append('service.js', `require("./kafka/app")\n`)
}

const createConsumers = (toolbox, consumers) =>
{
    toolbox.print.info("- Adicionando Consumers")

    consumers.map(async (consumer) => {
        const consumerProps = 
        {
            methods: "",
            initMethods: "",
            subdomain: `${consumer.subdomain.charAt(0).toUpperCase()}${consumer.subdomain.slice(1)}`
        }

        toolbox.print.success(`Subdomínio: ${consumer.subdomain}`)
        
        consumer.data.map((topic) => 
        {
            toolbox.print.success(`tópico: ${topic.topic}`)

            consumerProps.initMethods += `await this.${topic.topic}()\n\t\t`

            consumerProps.methods +=
`
    async ${topic.topic}()
    {
        const consumer = Kafka.consumer({ groupId: '${topic.groupId}' })

        await consumer.connect()
        await consumer.subscribe({ topic: '${topic.topic}', fromBeginning: '${topic.fromBeginning}' })

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                this.subcribers.map((subscriber) => {
                    if(subscriber.topic == topic)
                    {
                        subscriber.callback(message)
                    }
                })
            },
        })
    }
`
        })

        await toolbox.template.generate({
            props: consumerProps,
            template: `consumers/consumer.ejs`,
            target: `kafka/consumers/${consumerProps.subdomain}.js`
        })
    })
}

const createProducers = (toolbox, producers) =>
{
    toolbox.print.info("- Adicionando Producers")

    producers.map(async (producer) => {
        const producerProps = 
        {
            methods: "",
            initMethods: "",
            subdomain: `${producer.subdomain.charAt(0).toUpperCase()}${producer.subdomain.slice(1)}`
        }

        toolbox.print.success(`Subdomínio: ${producer.subdomain}`)
        
        producer.data.map((topic) => 
        {
            toolbox.print.success(`tópico: ${topic.topic}`)

            producerProps.initMethods += `await this.${topic.topic}()\n\t\t`

            if(topic.retry == true)
            {
                producerProps.methods +=
`
    async ${topic.topic}(message)
    {
        const producer = Kafka.producer({
            idempotent: ${topic.idempotent},
            retry: 
            {
                maxRetryTime: ${topic.maxRetryTime}
            }
        })

        await producer.connect()
        await producer.send({
            topic: '${topic.topic}',
            messages: [message]
        })
    }
`
            }
            else
            {
producerProps.methods +=
`
    async ${topic.topic}(message)
    {
        const producer = Kafka.producer({
            idempotent: ${topic.idempotent},
        })

        await producer.connect()
        await producer.send({
            topic: '${topic.topic}',
            messages: [message]
        })
    }
`
            }
        })

        await toolbox.template.generate({
            props: producerProps,
            template: `producers/producer.ejs`,
            target: `kafka/producers/${producerProps.subdomain}.js`
        })
    })
}

const createDomainConsumers = (toolbox, consumers) =>
{
    toolbox.print.info("- Adicionando Consumers Controllers")

    consumers.map(async (consumer) => {
        const consumerProps = 
        {
            subscribers: "",
            methods: "",
            subdomain: `${consumer.subdomain.charAt(0).toUpperCase()}${consumer.subdomain.slice(1)}`
        }

        toolbox.print.success(`Subdomínio: ${consumer.subdomain}`)
        
        consumer.data.map((topic) => 
        {
            toolbox.print.success(`tópico: ${topic.topic}`)

            consumerProps.subscribers += `${consumerProps.subdomain}Consumer.addSubcriber({topic: '${topic.topic}', callback: Consumer.${topic.topic}})\n\t\t`

            consumerProps.methods +=
`
    static ${topic.topic}(message)
    {

    }
`
        })

        await toolbox.template.generate({
            props: consumerProps,
            template: `domain/subdomain/consumer.ejs`,
            target: `domain/${consumer.subdomain}/Consumers.js`
        })
    })
}

const createDomainProducers = (toolbox, producers) =>
{
    toolbox.print.info("- Adicionando Producers Controllers")

    producers.map(async (producer) => {
        const producerProps = 
        {
            subscribers: "",
            methods: "",
            subdomain: `${producer.subdomain.charAt(0).toUpperCase()}${producer.subdomain.slice(1)}`
        }

        toolbox.print.success(`Subdomínio: ${producer.subdomain}`)
        
        producer.data.map((topic) => 
        {
            toolbox.print.success(`tópico: ${topic.topic}`)

            producerProps.methods +=
`
    static ${topic.topic}(message)
    {
        const message = {key, data}
        ${producerProps.subdomain}KafkaProducer.${topic.topic}(message)
    }
`
        })

        await toolbox.template.generate({
            props: producerProps,
            template: `domain/subdomain/producer.ejs`,
            target: `domain/${producer.subdomain}/Producers.js`
        })
    })
}