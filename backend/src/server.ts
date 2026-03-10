import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WorkspaceService } from './services/workspace.service';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { LogService } from './services/log.service';
import { NewsService } from './services/news.service';
import { SystemService } from './services/system.service';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/user-space/save', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        // Note: Use o nome exato da função que está no seu Service
        const result = await WorkspaceService.saveWorkspace(userId, req.body);
        res.json(result);
    } catch (error: any) {
        console.error("❌ Erro no Backend:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Rota para pegar o perfil
app.get('/user/profile/:id', async (req, res) => {
    try {
        const profile = await UserService.getUserProfile(req.params.id);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para atualizar o perfil
app.patch('/user/profile/:id', async (req, res) => {
    try {
        const updated = await UserService.updateProfile(req.params.id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para ganhar XP (ex: quando o usuário completa uma tarefa no OS)
app.post('/user/add-xp', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const result = await UserService.addExperience(userId, amount);
        res.json({ message: "XP Adicionado!", user: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/user/setup-test', async (req, res) => {
    try {
        const { id, name, email } = req.body;
        const user = await UserService.createUser(id, name, email);
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para postar no Lounge
app.post('/lounge/post', async (req, res) => {
    try {
        const { userId, content } = req.body;
        const post = await PostService.createPost(userId, content);
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para ver o Feed
app.get('/lounge/feed', async (req, res) => {
    try {
        const feed = await PostService.getLoungeFeed();
        res.json(feed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para comentar
app.post('/lounge/comment', async (req, res) => {
    try {
        const { postId, userId, content } = req.body;
        const comment = await PostService.addComment(postId, userId, content);
        res.json(comment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para Like
app.post('/lounge/like', async (req, res) => {
    try {
        const { postId, userId } = req.body;
        const updatedPost = await PostService.toggleLike(postId, userId);
        res.json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para ver os logs (Admin)
app.get('/system/logs', async (req, res) => {
    try {
        const logs = await LogService.getLogs();
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/news/create', async (req, res) => {
    try {
        const news = await NewsService.createNews(req.body);
        res.json(news);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/news/list', async (req, res) => {
    try {
        const news = await NewsService.getAllNews();
        res.json(news);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/system/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await SystemService.setSetting(key, value);
        res.json(setting);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/system/settings/:key', async (req, res) => {
    try {
        const setting = await SystemService.getSetting(req.params.key);
        res.json(setting);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});