// `npm i express`

const express = require('express');

const postsRouter = require('./posts/postsRouter.js');

const server = express();
const port = 8000;

server.use(express.json()); // parse JSON from body
server.use('/api/posts', postsRouter);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});