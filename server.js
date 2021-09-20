const express = require('express')
const path = require('path')
const cors = require('cors')

const PORT = process.env.PORT || 4300

const corsOptions = {
    origin: 'https://dss-course-work.herokuapp.com'
}

const app = express()
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "*");
       
    next();
});

app.use(cors(corsOptions))
app.use(express.static(__dirname))
app.use(express.static(path.resolve(__dirname, 'build')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT)
