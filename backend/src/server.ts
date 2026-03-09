import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { WorkspaceService } from './services/workspace.service';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { LogService } from './services/log.service';
import { NewsService } from './services/news.service';
import { SystemService } from './services/system.service';
import { LibraryService } from './services/library.service';
import { zaeonGuard } from './middlewares/auth.middleware';
import { LayoutService } from './services/layout.service';
import { SearchService } from './services/search.service';
import { ShareService } from './services/share.service';
import { ModuleService } from './services/module.service';
import { RoomService } from './services/room.service';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// 2. Socket.io para aceitar conexões do seu Frontend
const io = new Server(httpServer, {
    cors: {
        origin: "*", // trocar pela url do frontend
        methods: ["GET", "POST"]
    }
});

// 3. Escutando novas conexões
io.on('connection', (socket) => {
    // O Frontend deve enviar o userId na conexão (query)
    const userId = socket.handshake.query.userId as string;

    if (userId) {
        console.log(`📡 Usuário ${userId} conectou ao Zaeon (Socket: ${socket.id})`);

        // Marcamos como Online no Banco
        UserService.updateStatus(userId, true);

        // Avisamos a todos em tempo real
        io.emit('USER_STATUS_CHANGED', { userId, online: true });
    }

    socket.on('disconnect', () => {
        if (userId) {
            console.log(`💤 Usuário ${userId} saiu do sistema.`);
            UserService.updateStatus(userId, false);
            io.emit('USER_STATUS_CHANGED', { userId, online: false });
        }
    });
});

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
// Rota Unificada de Postagem 
app.post('/posts', async (req, res) => {
    try {
        const { userId, content, roomId } = req.body;
        const post = await PostService.createPost(userId, content, roomId);
        res.status(201).json(post);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Rota de Feed Dinâmico 
app.get('/posts/:roomId', async (req, res) => {
    try {
        const feed = await PostService.getFeed(req.params.roomId);
        res.json(feed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para ver o Feed
app.get('/lounge/feed/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const feed = await PostService.getFeed(roomId);
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

// Adiciona o 'zaeonGuard' como segundo parâmetro
app.post('/library/save', zaeonGuard, async (req, res) => {
    try {
        const { userId, item } = req.body;

        // Verificação de segurança: O ID autenticado é o mesmo que quer salvar o arquivo?
        if (userId !== (req as any).authenticatedUserId) {
            return res.status(403).json({ error: "Você não tem permissão para alterar este espaço." });
        }

        const result = await LibraryService.saveItem(userId, item);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/layout/save', async (req, res) => {
    const { userId, windows } = req.body;
    const updated = await LayoutService.saveLayout(userId, windows);
    res.json(updated);
});

app.get('/search', async (req, res) => {
    const { userId, q } = req.query;

    if (!userId || !q) {
        return res.status(400).json({ error: "Parâmetros userId e q são obrigatórios" });
    }

    try {
        const results = await SearchService.globalSearch(userId as string, q as string);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/library/share', async (req, res) => {
    const { fromUserId, toUserId, fileId } = req.body;

    try {
        const result = await ShareService.shareFile(fromUserId, toUserId, fileId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para o Frontend listar os módulos no Fabricator
app.get('/fabricator/catalog', async (req, res) => {
    try {
        const catalog = await ModuleService.getCatalog();
        res.json(catalog);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota administrativa para dar "boot" no catálogo
app.post('/fabricator/seed', async (req, res) => {
    try {
        const result = await ModuleService.seedCatalog();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/fabricator/install', async (req, res) => {
    try {
        const { userId, moduleName } = req.body;
        const updatedSpace = await ModuleService.installModule(userId, moduleName);

        // Log de Auditoria para Gamificação futura
        await LogService.createLog(userId, "MODULE_INSTALLED", `Módulo: ${moduleName}`);

        res.json({ message: "Módulo instalado com sucesso!", updatedSpace });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// NOVA ROTA: Gerenciamento de Salas
app.post('/rooms', async (req, res) => {
    try {
        const { name, slug, ownerId, description } = req.body;

        if (!ownerId) {
            return res.status(400).json({ error: "ownerId é obrigatório para criar uma sala." });
        }

        const room = await RoomService.createRoom(name, slug, ownerId, description);
        res.status(201).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar sala" });
    }
});

app.get('/rooms', async (req, res) => {
    const rooms = await RoomService.getAllRooms();
    res.json(rooms);
});

export { io };

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Zaeon Kernel Online na porta ${PORT}`);
});
