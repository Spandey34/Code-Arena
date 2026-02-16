require('dotenv').config();
const { connectDB } = require('./config/db');
const { app, server, io } = require('./services/socketService');
const userRoute = require('./routes/userRoute');
const problemRoute = require('./routes/problemRoute');
const submissionRoute = require('./routes/submissionRoute');
const matchRoute = require('./routes/matchRoute');
const contestRoute = require('./routes/contestRoute');
const editorialRoute = require('./routes/editorialRoute');
const blogRoute = require('./routes/blogRoute');
const adminRoute = require('./routes/adminRoute'); // Add this line

// Connect to MongoDB
connectDB();

//routes
app.use('/api/user', userRoute);
app.use('/api/problem', problemRoute);
app.use('/api/submission', submissionRoute);
app.use('/api/match', matchRoute);
app.use('/api/contest', contestRoute);
app.use('/api/editorial', editorialRoute);
app.use('/api/blog', blogRoute);
app.use('/api/admin', adminRoute); // Add this line

// Simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Code Arena Backend is running!');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});