import mongoose from 'mongoose';

const CitationSchema = new mongoose.Schema(
	{
		query: { type: String, index: true },
		title: String,
		url: String,
		domain: String,
	},
	{ timestamps: true }
);

export default mongoose.model('Citation', CitationSchema);