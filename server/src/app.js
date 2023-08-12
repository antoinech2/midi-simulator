const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const {spawn} = require('node:child_process') 
const port = process.env.PORT || 3001


app.use(bodyParser.json())
.use(cors())

app.get('/', (req, res) => {
    res.json("Ok")
})

app.use('/tracking', express.static('./../public'))

require('./routes/Fixtures')(app)
require('./routes/Room')(app)
require('./routes/Track')(app)
require('./routes/Fixture')(app)


const server = app.listen(port, () => {
  console.log('Application démarrée')
  const url = "http://localhost:"+port+"/tracking"
  spawn('explorer.exe', [url])
})

require('./routes/close')(app, server)

app.use(({res}) => {
  const message = 'Impossible de trouver la ressource demandée.'
    res.status(404).json({message});
});