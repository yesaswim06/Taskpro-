// User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
module.exports = mongoose.model('User', mongoose.models.User || UserSchema);

// Task.js
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Task', mongoose.models.Task || TaskSchema);