import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js'; 
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { app,server } from './lib/socket.js';
import path from 'path';

dotenv.config();


const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// ✅ 1. CORS should be the first middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ 2. JSON parser with increased limit (important for base64 images)
app.use(express.json({ limit: '10mb' }));

// ✅ 3. Parse cookies
app.use(cookieParser());

// ✅ 4. Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
  });
}

// ✅ 5. Start server and connect DB
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
