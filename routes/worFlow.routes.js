import { Router } from 'express';
import reminderWorkflow from '../controllers/workFlow.controller.js';

const workflowRouter = Router();

// Upstash workflow endpoint
workflowRouter.use('/subscription/reminder', reminderWorkflow);

export default workflowRouter;
