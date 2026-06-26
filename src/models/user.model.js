const  mongoose = require("mongoose");
const  bcrypt = require("bcryptjs");



const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email format is invalid."],
        unique: [true, "Email already exists."]
    },
    name:{
        type:String,
        default: null
    },
    password:{
        type:String,
        required: true,
        minlength: [6,"Password should contain atleast 6 characters"],
        select: false
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
},{
    timestamps: true
});

userSchema.pre("save", async function() {
    if(!this.isModified('password')){
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    return;
});

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;