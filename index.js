const express=require('express');
const app=express();
const port=8000;
const users=require('./MOCK_DATA.json')

app.get('/users',(req,res)=>{
    return res.json(users);
})

app.listen(port,()=>{
    console.log(`Server started at port=${port}`);
})