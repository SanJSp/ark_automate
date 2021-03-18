const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ssotModels = require('../../models/singleSourceOfTruthModel.js');
const uaoModels = require('../../models/userAccessObjectModel');

const setupSsot = (conn, uri) => {
  const ssot = conn.model('SSoT'); // define model
  conn.openUri(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  ssot.createCollection().then(() => {
    ssot.insertMany({
      starterId: 'starterId1',
      robotName: 'testRobot',
      elements: [
        {
          type: 'MARKER',
          name: 'startEvent',
          predecessorIds: [],
          successorIds: [],
        },
      ],
    });
  });
  console.log('Created ssot');
};

const setupUao = (conn, uri) => {
  const uao = conn.model('userAccessObject'); // define model
  conn.openUri(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  uao.createCollection().then(() => {
    uao.insertMany({
      AccessLevel: '0',
      robotId: '604a3ba6561e2d1fad4eda20',
      userId: '604a3ba6561e2d1fad4eda60',
    });
  });
  console.log('Created user access object');
};

const mongod = new MongoMemoryServer({
  instance: {
    dbName: 'ark-automate',
    port: 59051,
  },
});

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  const uri = await mongod.getUri();
  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  };
  const conn = await mongoose.createConnection(uri, mongooseOpts);
  await mongoose.connect(uri);
  console.log(mongoose.connection.readyState);
  console.log('Connected to MongoDB with uri:', uri);
  setupSsot(conn, uri);
  setupUao(conn, uri);
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  const uri = await mongod.getUri();
  await mongoose.connect(uri);

  await mongoose.connection.dropDatabase();
  console.log(mongoose.connection.readyState);
  console.log('Dropped Database of :', uri);
  await mongoose.connection.close();
  mongoose.disconnect();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;
  const uri = await mongod.getUri();
  await mongoose.connect(uri);

  // fix according to https://docs.w3cub.com/eslint/rules/no-await-in-loop.html
  const result = [];
  for (const key in collections) {
    const collection = collections[key];
    result.push(collection.deleteMany());
  }

  console.log('Emptied Database of :', uri);

  return Promise.all(result);
};

this.connect();
let end = Date.now() + 5000;
while (Date.now() < end);
this.clearDatabase();
end = Date.now() + 5000;
while (Date.now() < end);
this.closeDatabase();
