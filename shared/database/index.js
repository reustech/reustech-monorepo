import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
    if (isConnected) {
        console.log('MongoDB ya conectado');
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI no está definida');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

// Exportar modelos
export * from './models/User.js';
export * from './models/Project.js';
export * from './models/Task.js';
export * from './models/Trade.js';
export * from './models/AudioChunk.js';