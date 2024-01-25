const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE;

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(()=>console.log('connected'));

const port = process.env.PORT || 3000;
console.log(port);
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
