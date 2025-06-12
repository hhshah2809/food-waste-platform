const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");  // Add this at top

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: { 
    type: String, 
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  password: { 
    type: String, 
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false  // Never return password in queries
  },
  passwordChangedAt: Date,  // For tracking password changes
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: { 
    type: String, 
    enum: ["user", "admin", "donor"],  // Added donor role
    default: "user" 
  },
  active: {
    type: Boolean,
    default: true,
    select: false  // Hide from queries
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: [Number],  // [longitude, latitude]
      index: "2dsphere"
    }
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Password hashing middleware (unchanged from your version)
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method (unchanged from your version)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Only show active users in queries
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;