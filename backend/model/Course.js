const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        required: true,
        unique: true
      },
      description: {
        type: String,
        default: null
      },
      text_content: {
        type: String,
        default: null
      },
      ars_price: {
        type: Number,
        required: true
      },
      usd_price: {
        type: Number,
        required: true
      },
      discount_ars: {
        type: Number,
        default: null
      },
      discount_usd: {
        type: Number,
        default: null
      },
      thumbnail: {
        type: String,
        default: null
      },
      video: {
        type: String,
        default: null
      },
      author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      }
    });

module.exports = mongoose.model('Course', courseSchema);
