// @ts-nocheck

function delay(config, next) {
  setTimeout(() => {
    next()
  }, config.timeout)
}

function debug(config) {
  console.log(config)
}

const nodes = [
  {
    type: 'delay',
    timeout: 3000
  },
  {
    type: 'debug',

  }
]

function flow(nodes = []) {
  for (const node of nodes) {
    console.log(node)
  }
}

flow(nodes)