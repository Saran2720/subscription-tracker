import { Router } from 'express';

const workflowRouter = Router();


workflowRouter.get('/', (req, res) => res.send({ title: 'workflowrouter' }));


export default workflowRouter;