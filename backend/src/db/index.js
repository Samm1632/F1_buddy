import mongoose from 'mongoose';

export async function connectMongo(uri) {
	if (!uri) throw new Error('MONGODB_URI is required');
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5000,
	});
	console.log('Connected to MongoDB');
}