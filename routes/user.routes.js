import { Router } from 'express';
import { deleteuser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id',authorize,getUser);

userRouter.put('/:id',authorize,updateUser);

userRouter.delete('/:id',authorize,deleteuser);

export default userRouter;