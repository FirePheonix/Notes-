import mongoose, { Document, Schema } from 'mongoose';
import { Chat, Element } from '../types/index.js';

// Element subdocument schema
const PointSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const ElementSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['select', 'hand', 'rectangle', 'diamond', 'circle', 'arrow', 'line', 'draw', 'text', 'image', 'eraser', 'code']
  },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  strokeColor: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  strokeWidth: { type: Number, required: true, enum: [1, 2, 4] },
  strokeStyle: { type: String, required: true, enum: ['solid', 'dashed', 'dotted'] },
  roughness: { type: Number, required: true, enum: [0, 1, 2] },
  opacity: { type: Number, required: true, min: 0, max: 1 },
  points: [PointSchema],
  text: { type: String },
  fontSize: { type: Number },
  fontFamily: { type: String },
  imageUrl: { type: String },
  angle: { type: Number, required: true },
  isDeleted: { type: Boolean, required: true },
  code: { type: String },
  codeLanguage: { type: String },
  codeOutput: { type: String },
  codeExplanation: { type: String },
  isExecuting: { type: Boolean }
}, { _id: false });

// Chat document interface
export interface ChatDocument extends Document {
  userId: string;
  title: string;
  elements: Element[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat schema
const ChatSchema = new Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  elements: [ElementSchema]
}, {
  timestamps: true
});

// Create indexes
ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, title: 'text' });

// Export model
export const ChatModel = mongoose.model<ChatDocument>('Chat', ChatSchema);
