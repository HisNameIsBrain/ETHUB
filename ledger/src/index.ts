import { config } from 'dotenv';
import app from './api.js';
config();
const PORT = Number(process.env.PORT ?? 7070);
app.listen(PORT, () => console.log(`ledger on :${PORT}`));
