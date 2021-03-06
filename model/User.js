import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { ADMIN, SUPER, USER } from '../config/roles.js';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username required.'],
      unique: [true, 'This username already exists.'],
      minLength: [4, 'Username must be at least 4 characters.'],
      maxLength: [20, 'Username must be less than or equal to 20 characters.'],
    },
    password: {
      type: String,
      required: [true, 'Insert a password is mandatory.'],
      minLength: [6, 'Password must be at least 6 chraracters.'],
    },
    role: {
      type: String,
      enum: [USER, ADMIN, SUPER],
      default: USER,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.generateToken = function () {
  const ACCESS_TOKEN_SECRECT = process.env.ACCESS_TOKEN_SECRECT;
  const ACCESS_TOKEN_EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION_TIME;
  const payload = { _id: this._id };

  return jwt.sign(payload, ACCESS_TOKEN_SECRECT, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
  });
};

UserSchema.methods.isMatch = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
