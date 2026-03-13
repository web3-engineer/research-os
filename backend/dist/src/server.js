var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.post('/user-space/save', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId)
            return res.status(400).json({ error: "userId is required" });
        // Note: Use o nome exato da função que está no seu Service
        const result = yield WorkspaceService.saveWorkspace(userId, req.body);
        res.json(result);
    }
    catch (error) {
        console.error("❌ Erro no Backend:", error.message);
        res.status(500).json({ error: error.message });
    }
}));
// Rota para pegar o perfil
app.get('/user/profile/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield UserService.getUserProfile(req.params.id);
        if (!profile)
            return res.status(404).json({ error: "Perfil não encontrado" });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para atualizar o perfil
app.patch('/user/profile/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield UserService.updateProfile(req.params.id, req.body);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para ganhar XP (ex: quando o usuário completa uma tarefa no OS)
app.post('/user/add-xp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, amount } = req.body;
        const result = yield UserService.addExperience(userId, amount);
        res.json({ message: "XP Adicionado!", user: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.post('/user/setup-test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email } = req.body;
        const user = yield UserService.createUser(id, name, email);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para postar no Lounge
app.post('/lounge/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, content } = req.body;
        const post = yield PostService.createPost(userId, content);
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para ver o Feed
app.get('/lounge/feed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feed = yield PostService.getLoungeFeed();
        res.json(feed);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para comentar
app.post('/lounge/comment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId, content } = req.body;
        const comment = yield PostService.addComment(postId, userId, content);
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para Like
app.post('/lounge/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        const updatedPost = yield PostService.toggleLike(postId, userId);
        res.json(updatedPost);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rota para ver os logs (Admin)
app.get('/system/logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = yield LogService.getLogs();
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.post('/news/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield NewsService.createNews(req.body);
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.get('/news/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield NewsService.getAllNews();
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.post('/system/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value } = req.body;
        const setting = yield SystemService.setSetting(key, value);
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.get('/system/settings/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield SystemService.getSetting(req.params.key);
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
