
const command = 
{
    name: 'add:kafka',
    description: 'Adiciona o módulo Kafka ao projeto conforme o template enviado.',
    run: async toolbox => 
    {
        const module = await toolbox.validate(toolbox)

        toolbox.print.info("\n")
        toolbox.print.info("###################################################")
        toolbox.print.info("##       Instalando dependências do Módulo       ##")
        toolbox.print.info("###################################################")
        toolbox.print.info(await toolbox.system.run('npm install kafkajs'))

        toolbox.print.info("###################################################")
        toolbox.print.info("##         Adicionando módulo ao projeto         ##")
        toolbox.print.info("###################################################")
        await toolbox.createModule(toolbox)

        toolbox.print.info("\n")
        toolbox.print.info("###################################################")
        toolbox.print.info("##         Executando template do módulo         ##")
        toolbox.print.info("###################################################")
        const {consumers, producers} = await toolbox.readTemplate(toolbox, module)
        await toolbox.createConsumers(toolbox, consumers)
        await toolbox.createProducers(toolbox, producers)
        await toolbox.createDomainConsumers(toolbox, consumers)
        await toolbox.createDomainProducers(toolbox, producers)

        toolbox.print.info("\n")
        toolbox.print.success(`Módulo ${module.name} adicionado com sucesso!`)
        toolbox.print.info("\n")
    }
}
  
module.exports = command
