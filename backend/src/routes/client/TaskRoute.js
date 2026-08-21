import { Router } from "express";
import { getMyTasks, markTaskDone } from "../../controllers/client/taskController.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const taskRouter = Router();

taskRouter.use(authenticateToken);

taskRouter.get("/my-tasks", getMyTasks);
taskRouter.patch("/:taskId/done", markTaskDone);

export default taskRouter;
