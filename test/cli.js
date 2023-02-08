#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const checkLogPass = argv => {
  if ((typeof argv.token != 'string') && (typeof argv.login != 'string' || typeof argv.password != 'string')) {
    console.error('[!] Please provide login and password for this command');
    process.exit(0);
  }
}

async function action(argv, cb) {
  try {
    if (argv._.find(e => e != 'get' && e != 'list')) {
      checkLogPass(argv);
    }
    const { login, password, token: inputToken = null } = argv;
    if (inputToken || (typeof login == 'string' && typeof password == 'string')) {
      const token = inputToken || await api.post('/signin', { login, password }).then(resp => resp.data);
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await cb(api);
    console.log('[*] Response', res);
  } catch(e) {
    //console.log(e);
    console.log('[!] error');
  }
}

yargs(hideBin(process.argv))
  .command('signup <login> <password>', 'sign up', (yargs) => {
    return yargs
      .positional('login', {
        describe: 'user name',
        type: 'string',
      })
      .positional('password', {
        describe: 'user password',
        type: 'string',
      })
  }, async (argv) => {
    try {
      const { login, password } = argv;
      const token = await api.post('/signup', { login, password }).then(resp => resp.data);
      console.log('[*] signed up:', token);
    } catch(e) {
      console.log('[!] error');
    }
  })
  .command('create <json>', 'create a car', (yargs) => {
    return yargs
      .positional('json', {
        describe: 'payload',
        type: 'string',
      })
  }, async (argv) => {
    const { json } = argv;
    await action(argv, (api) => api.post('/car', JSON.parse(json)).then(resp => resp.data));
  })
  .command('update <id> <json>', 'update a car', (yargs) => {
    return yargs
      .positional('json', {
        describe: 'payload',
        type: 'string',
      })
  }, async (argv) => {
    const { id, json } = argv;
    await action(argv, (api) => api.patch(`/car/${id}`, JSON.parse(json)).then(resp => resp.data));
  })
  .command('delete <id>', 'delete a car', (yargs) => {
    return yargs
      .positional('id', {
        describe: 'payload',
        type: 'string',
      })
  }, async (argv) => {
    const { id } = argv;
    await action(argv, (api) => api.delete(`/car/${id}`).then(resp => resp.data));
  })
  .command('get <id>', 'get a car', (yargs) => {
    return yargs
      .positional('id', {
        describe: 'id',
        type: 'string',
      })
  }, async (argv) => {
    const { id } = argv;
    await action(argv, (api) => api.get(`/car/${id}`).then(resp => resp.data));
  })
  .command('list', 'get a car', (yargs) => {
    return yargs
      .option('list-size', {
        type: 'number',
        describe: 'number of objects',
      })
      .option('page', {
        type: 'number',
        describe: 'page',
      })
      .option('order-by', {
        type: 'string',
        describe: 'ordergin',
      })
      .option('asc', {
        type: 'boolean',
        describe: 'ascending order',
      })
  }, async (argv) => {
    const params = new URLSearchParams();
    params.append('list_size', argv['list-size'] || 10);
    params.append('order_by', argv['order-by'] || 'createdAt');
    params.append('page', argv['page'] || 1);
    if (Boolean(argv.asc)) {
      params.append('asc', true);
    }
    await action(argv, (api) => api.get(`/car/list?${params.toString()}`).then(resp => resp.data));
  })
  .option('login', {
    alias: 'l',
    type: 'string',
    describe: 'user name',
  })
  .option('password', {
    alias: 'p',
    type: 'string',
    describe: 'user password',
  })
  .option('token', {
    alias: 't',
    type: 'string',
    describe: 'use your token instead of getting new from credentials',
  })
  .demandCommand()
  .help()
  .parse()
