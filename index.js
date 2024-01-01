const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000

app.get('/', (req,res)=>{
    res.send('Welcome to my server!')
})

app.listen(port , () => {
    console.log(`star my server on port ${port}`);
})