
import mongoose from 'mongoose'

 async function connectDB(){
       await mongoose.connect('mongodb+srv://zola:zola@cluster0.8oaktx9.mongodb.net/inv');
       console.log("db connected");
} 

export default connectDB;