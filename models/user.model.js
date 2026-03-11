import monggose from 'mongoose';

//defining schema
const  userSchema = new monggose.Schema({
    name:{
        type:String,
        required:[true, 'Name is required'],
        time:true,
        minLenth:2,
        maxLenth:50,
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        trim:true,
        unique:true,
        lowercase: true,
        match:[/\S+@\S+\.\S+/,'Please fill the valid email address'],
    },
    password:{
        type: String,
        required:[true, 'Password is required'],
        minLenth:6,
        maxLenth:16,
    }
},{timestamps:true});

//user model
const User = monggose.model('User',userSchema);

export default User;