const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const compression = require('compression');
const { Client } = require('@googlemaps/google-maps-services-js');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(express.json());
app.use(cors());
const client = new Client({});
let redisConnected = false;

// Redis for cache
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (error) => { console.error(`Error : ${error}`); });
redisClient.on('connect', () => { console.log('Redis Connected'); redisConnected = true; });
// redisClient.connect();

// Function to flush Redis
// async function flushRedis() {
//   if (redisConnected) {
//     const allKeys = await redisClient.keys('*');
//     for (let i = 0; i < allKeys.length; i += 1) {
//       redisClient.del(allKeys[i]);
//     }
//   }
// }
// flushRedis();

// Server and sockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://192.168.15.28:3000',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log('New websocket user connected');
  socket.on('query', async (msg) => {
    try {
      let cachedValue;
      if (redisConnected) {
        cachedValue = await redisClient.get(msg);
      }
      if (cachedValue) {
        socket.emit('suggestions', JSON.parse(cachedValue));
      } else {
        client.placeAutocomplete({
          params: {
            input: msg,
            key: process.env.GOOGLE_API_KEY,
            components: 'country:us',
            location: '40.7128,-74.0060',
            radius: 100000,
          },
          timeout: 1000,
        }).then(async (res) => {
          if (res.data?.predictions?.length > 1) {
            // console.log('From API - length: ', res.data.predictions.length);
            if (redisConnected) {
              await redisClient.set(msg, JSON.stringify(res.data));
              await redisClient.expire(msg, 60 * 60 * 24 * 7);
            }
            socket.emit('suggestions', res.data);
          } else {
            socket.emit('suggestions', []);
          }
        }).catch((e) => {
          console.log(e.response);
          socket.emit('error', e.response.data);
        });
      }
    } catch (e) {
      socket.emit('error', e);
    }
  });
});

// Listen for webhook events //
server.listen(process.env.PORT || 3370, () => console.log('server is listening'));
