  
const command = {
    name: 'template:kafka',
    description: 'Gera um template de configuração para instalação do módulo Mongo',
    run: async toolbox => {
      toolbox.print.success("- Adicionando: mongo.json")
      await toolbox.template.generate({
          template: 'template.json',
          target: `kafka.json`,
      })
    }
  }
  
  module.exports = command