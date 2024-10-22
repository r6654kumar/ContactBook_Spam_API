import express, {request,response} from 'express';
import userRoutes from './routes/userRoutes.js';
import { db } from './models/index.js';
const app = express();
app.use(express.json());

app.use('/api', userRoutes);

db.sync({ force: false }).then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}).catch((err)=>{
    console.log("Error Syncing Database");
});
