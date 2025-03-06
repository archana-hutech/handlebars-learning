// src/server.ts
import app from './app';

const PORT = 3004;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
