import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { authManager } from './src/api/authStore';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// CORS middleware to support Android WebView/Capacitor and multi-origin calls
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Sapana Park CHS Resident Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/auth/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AuthAPI',
    database: 'Active',
    registeredUsersCount: authManager.getAllUsers().length,
  });
});
app.post('/api/auth/register', (req, res) => {
  try {
    const result = authManager.registerUser(req.body);
    if (!result.success) {
      if (result.message && (result.message.includes('already registered') || result.message.includes('already exists'))) {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Server error during registration.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;
    if (!loginIdentifier) {
      return res.status(400).json({ success: false, message: 'Email or Mobile Number is required.' });
    }
    const result = authManager.loginUser(loginIdentifier, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Server error during login.' });
  }
});

app.post('/api/auth/google', (req, res) => {
  try {
    const { googleId, email, fullName, profilePhoto } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, message: 'Google profile information incomplete.' });
    }
    const result = authManager.googleAuth({
      googleId: googleId || `G-${Date.now()}`,
      email,
      fullName,
      profilePhoto,
    });
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Google authentication failed.' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or Mobile Number required.' });
    }
    const result = authManager.requestPasswordReset(identifier);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Error processing request.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;
    if (!identifier || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const result = authManager.resetPassword(identifier, resetToken, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Password reset failed.' });
  }
});

// USER PROFILE API
app.put('/api/users/profile', (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required.' });
    }
    const updated = authManager.updateUserProfile(userId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, message: 'Profile updated successfully.', user: updated });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to update profile.' });
  }
});

// ADMIN USER MANAGEMENT API
app.get('/api/admin/users', (req, res) => {
  try {
    const users = authManager.getAllUsers();
    return res.json({ success: true, users });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to fetch users.' });
  }
});

app.patch('/api/admin/users/:id/status', (req, res) => {
  try {
    const userId = req.params.id;
    const { verificationStatus, accountStatus, role } = req.body;
    const updated = authManager.updateUserStatus(userId, verificationStatus, accountStatus, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, message: 'User status updated successfully.', user: updated });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to update user status.' });
  }
});

app.post('/api/admin/users/:id/reset-access', (req, res) => {
  try {
    const userId = req.params.id;
    const { defaultPassword } = req.body;
    const result = authManager.resetUserAccess(userId, defaultPassword);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      message: `Password reset successfully. Default Password: ${result.newPass}`,
      newPass: result.newPass,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Error resetting user access.' });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = authManager.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, message: 'User account deleted successfully.' });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to delete user.' });
  }
});

// Initialize Gemini AI Client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// API Route for AI Society Assistant
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { prompt, flatNumber } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        reply: `[Sapana Park AI Assistant] Regarding "${prompt}": Sapana Park CHS follows the Goa Co-operative Societies Act 2001. Maintenance bills are due on the 20th of each month. Late fee interest is 18% p.a. Non-occupancy fee for tenants is 10% of service charges. Office hours: Tue & Sat 6:00 PM - 8:00 PM.`,
      });
    }

    const systemInstruction = `You are the official AI Assistant for Sapana Park Co-operative Housing Society Ltd. (Sapana Park CHS), located in Porvorim, Bardez, Goa (Registration No. HSG-(G)-452 / 2008).
You assist flat owners and tenants (User is from Flat ${flatNumber || 'A-302'}).
Provide clear, helpful, polite responses regarding:
- Society Maintenance fees, due dates (20th of every month), and interest (18% p.a.)
- Non-occupancy charges (capped at 10% of service charges under Goa Act Sec 69)
- Tenant NOC applications and Porvorim police verification Form N-1
- Flat renovation noise hours (strictly 9 AM to 6 PM Mon-Sat)
- Society Managing Committee details (Secretary: Rajesh Naik, Treasurer: Anjali Deshmukh)
Keep answers concise, direct, and formatted cleanly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const text = response.text || 'Assistance provided under Sapana Park Society guidelines.';
    return res.json({ reply: text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.json({
      reply: `Regarding your query: Maintenance bills are due on the 20th. Overdue payments incur 18% p.a. simple interest under Sapana Park CHS Bye-Laws & Goa Societies Act 2001. You can also file a ticket under the Complaints tab.`,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Sapana Park Society App' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sapana Park App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
