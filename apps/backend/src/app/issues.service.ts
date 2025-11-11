import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Status, Priority } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async createIssue(data: { title: string; description?: string }) {
    return this.prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async findAllIssues() {
    return this.prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findIssueById(id: string) {
    return this.prisma.issue.findUnique({
      where: { id },
    });
  }

  async updateIssue(id: string, data: { title?: string; description?: string; status?: Status; priority?: Priority }) {
    return this.prisma.issue.update({
      where: { id },
      data,
    });
  }

  async deleteIssue(id: string) {
    return this.prisma.issue.delete({
      where: { id },
    });
  }
}