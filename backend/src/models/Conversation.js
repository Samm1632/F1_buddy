import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
	{
		role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
		content: { type: String, required: true },
		citations: [{
			title: String,
			url: String,
			domain: String,
		}]
	},
	{ _id: false }
);

const ConversationSchema = new mongoose.Schema(
	{
		sessionId: { type: String, index: true },
		messages: [MessageSchema],
	},
	{ timestamps: true }
);

export default mongoose.model('Conversation', ConversationSchema);