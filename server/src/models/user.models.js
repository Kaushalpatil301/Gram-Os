import mongoose, { mongo, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String
      },
      default: {
        url: `https://placehold.co/100x100`,
        localPath: ""
      },
    },

    username : {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    role: {
      type: String,
      enum: ['farmer', 'consumer', 'retailer', 'admin', 'worker', 'villager'],
      default: null
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    refreshToken: {
      type: String
    },

    forgotPasswordToken: {
      type: String
    },

    forgotPasswordExpiry: {
      type: Date
    },

    emailVerificationToken: {
      type: String
    },

    emailVerificationExpiry: {
      type: Date
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: []
      },
      address: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: ''
      },
      country: {
        type: String,
        default: ''
      },
      lastUpdated: {
        type: Date
      }
    }
  },
  {
    timestamps: true,
  },
)

userSchema.pre("save", async function () {
  if(!this.isModified("password")) return 
  this.password = await bcrypt.hash(this.password, 10) 
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id, 
      email: this.email,
      username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateTemporaryForgotPasswordToken = function(){
  const forgotToken = crypto.randomBytes(20).toString("hex") 

  const forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex") 

  const forgotPasswordExpiry = Date.now() + (20*60*1000) 

  return {forgotToken, forgotPasswordToken, forgotPasswordExpiry}
}

export const User = mongoose.model("User", userSchema)