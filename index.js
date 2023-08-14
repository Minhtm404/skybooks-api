require('dotenv').config();

const mongoose = require('mongoose');

const app = require('./app');

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD), {
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to the database!');
  });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log('App running on port', port);
});
