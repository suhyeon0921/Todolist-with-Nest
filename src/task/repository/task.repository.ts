import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 유저의 태스크 전체 조회 */
  public async findTasksByUserId(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId, deletedAt: null },
      include: { user: true },
      orderBy: {
        id: 'desc',
      },
    });
  }

  /** 유저의 태스크 개수 조회 */
  public async countTasksByUserId(
    userId: number,
    isDone?: boolean,
  ): Promise<number> {
    return this.prisma.task.count({
      where: { userId, isDone, deletedAt: null },
    });
  }

  /** 태스크 id로 태스크 조회 */
  public async findTaskByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  /** 태스크 생성 */
  public async createTask(data: {
    content: string;
    userId: number;
  }): Promise<Task> {
    return this.prisma.task.create({
      data,
    });
  }

  /** 태스크 업데이트 */
  public async updateTask(
    id: number,
    data: { content?: string; isDone?: boolean; deletedAt?: Date },
  ): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: { user: true },
    });
  }
}
