const mongoose = require('mongoose');
const dotenv = require('dotenv');

const mongoURI = "";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin"
})
.then(() => {
    console.log('Connected to MongoDB');
    
    return mongoose.connection.db.dropDatabase();
})
.then(() => {
    console.log('Database dropped');
})
.catch(error => {
    console.error('Error:', error);
})
.finally(() => {
    mongoose.disconnect();
});