
const command = 
{
    name: 'update:kafka',
    description: 'Atualiza o módulo Kafka conforme o template enviado.',
    run: async toolbox => 
    {
        let module = await toolbox.validate(toolbox)
        module = await toolbox.readTemplate(toolbox, module)
        
        if(toolbox.parameters.array.length == 0)
        {
            if(toolbox.parameters.options.domain)
            {
                await toolbox.createConsumers(toolbox, module.consumers)
                await toolbox.createProducers(toolbox, module.producers)
                await toolbox.createDomainConsumers(toolbox, module.consumers)
                await toolbox.createDomainProducers(toolbox, module.producers)
                process.exit(0)
            }

            await toolbox.createConsumers(toolbox, module.consumers)
            await toolbox.createProducers(toolbox, module.producers)
            process.exit(0)
        }

        if(toolbox.parameters.options.domain)
        {
            toolbox.parameters.array.map(async option => {
                const type = `${option.charAt(0).toUpperCase()}${option.slice(1)}`
                const method = `create${type}`
                const methodDomain = `createDomain${type}`
                toolbox[`${method}`](toolbox, module[option])
                toolbox[`${methodDomain}`](toolbox, module[option])
            })
            process.exit(0)
        }

        toolbox.parameters.array.map(async option => {
            const type = `${option.charAt(0).toUpperCase()}${option.slice(1)}`
            const method = `create${type}`
            await toolbox[`${method}`](toolbox, module[option])
        })
    }
}
  
module.exports = command
