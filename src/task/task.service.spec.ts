import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './repository/task.repository';
import { Task } from '@prisma/client';
import { CustomError } from '../common/error/custom-error';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: {
            findTasksByUserId: jest.fn(),
            countTasksByUserId: jest.fn(),
            findTaskByIdAndUserId: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTasks', () => {
    it('유저의 태스크 조회', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          content: 'task1',
          userId: 1,
          isDone: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          content: 'task2',
          userId: 1,
          isDone: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(taskRepository, 'findTasksByUserId')
        .mockResolvedValue(mockTasks);

      const tasks: Task[] = await service.getTasks(1);
      expect(tasks).toEqual(mockTasks);
    });

    it('유저의 태스크를 찾지 못할 시 에러', async () => {
      jest.spyOn(taskRepository, 'findTasksByUserId').mockResolvedValue(null);

      await expect(service.getTasks(1)).rejects.toThrow(CustomError);
    });
  });

  describe('getTaskCount', () => {
    it('유저의 태스크 개수 조회', async () => {
      jest
        .spyOn(taskRepository, 'countTasksByUserId')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const taskCount = await service.getTaskCount(1);
      expect(taskCount).toEqual({ completedTaskCount: 1, totalTaskCount: 2 });
    });
  });

  describe('findTask', () => {
    it('태스크 id로 태스크 조회', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'task',
        userId: 1,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(taskRepository, 'findTaskByIdAndUserId')
        .mockResolvedValue(mockTask);

      const task = await service.findTask(1, 1);
      expect(task).toEqual(mockTask);
    });

    it('태스크를 찾지 못할 시 에러', async () => {
      jest
        .spyOn(taskRepository, 'findTaskByIdAndUserId')
        .mockResolvedValue(null);

      await expect(service.findTask(1, 1)).rejects.toThrow(CustomError);
    });
  });

  describe('createTask', () => {
    it('태스크 생성', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'task',
        userId: 1,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(taskRepository, 'createTask').mockResolvedValue(mockTask);

      const task = await service.createTask('task', 1);
      expect(task).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('태스크 업데이트', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'updated task',
        userId: 1,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'findTask').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'updateTask').mockResolvedValue(mockTask);

      const task = await service.updateTask(1, 'updated task', 1);
      expect(task).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('태스크 삭제', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'task',
        userId: 1,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      jest.spyOn(service, 'findTask').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'updateTask').mockResolvedValue(mockTask);

      const task = await service.deleteTask(1, 1);
      expect(task.deletedAt).not.toBeNull();
    });
  });

  describe('completeTask', () => {
    it('태스크 완료', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'task',
        userId: 1,
        isDone: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'findTask').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'updateTask').mockResolvedValue(mockTask);

      const task = await service.completeTask(1, 1);
      expect(task.isDone).toBe(true);
    });
  });

  describe('uncompleteTask', () => {
    it('태스크 완료 취소', async () => {
      const mockTask: Task = {
        id: 1,
        content: 'task',
        userId: 1,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'findTask').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'updateTask').mockResolvedValue(mockTask);

      const task = await service.uncompleteTask(1, 1);
      expect(task.isDone).toBe(false);
    });
  });
});
