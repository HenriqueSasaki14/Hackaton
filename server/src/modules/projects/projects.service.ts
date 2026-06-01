import { prisma } from '../../lib/prisma'
import { isTrailCompleted } from '../trails/trails.service'

export async function getFeed() {
  return prisma.project.findMany({
    where: { status: 'PUBLISHED' }, orderBy: { created_at: 'desc' },
    include: { user: { select: { id: true, name: true, avatar_url: true } }, trail: { select: { id: true, title: true, slug: true } } },
  })
}

export async function getMyProjects(userId: string) {
  return prisma.project.findMany({
    where: { user_id: userId }, orderBy: { created_at: 'desc' },
    include: { trail: { select: { id: true, title: true, slug: true } } },
  })
}

export async function createProject(userId: string, data: { trail_id: string; title: string; description: string; code_url: string }) {
  const trail = await prisma.trail.findUnique({ where: { id: data.trail_id } })
  if (!trail) throw Object.assign(new Error('Trilha não encontrada'), { status: 404 })
  return prisma.project.create({ data: { user_id: userId, ...data, status: 'DRAFT' } })
}

export async function updateProject(projectId: string, userId: string, data: any) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 })
  if (project.user_id !== userId) throw Object.assign(new Error('Sem permissão'), { status: 403 })
  if (project.status === 'PUBLISHED') throw Object.assign(new Error('Projetos publicados não podem ser editados'), { status: 400 })
  return prisma.project.update({ where: { id: projectId }, data })
}

export async function publishProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 })
  if (project.user_id !== userId) throw Object.assign(new Error('Sem permissão'), { status: 403 })
  if (project.status === 'PUBLISHED') throw Object.assign(new Error('Projeto já está publicado'), { status: 400 })
  if (!await isTrailCompleted(userId, project.trail_id))
    throw Object.assign(new Error('Conclua 100% da trilha antes de publicar o projeto'), { status: 403 })
  return prisma.project.update({ where: { id: projectId }, data: { status: 'PUBLISHED' } })
}

export async function toggleLike(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 })
  if (project.status !== 'PUBLISHED') throw Object.assign(new Error('Só é possível curtir projetos publicados'), { status: 400 })
  const existing = await prisma.projectLike.findUnique({ where: { user_id_project_id: { user_id: userId, project_id: projectId } } })
  if (existing) {
    await prisma.$transaction([
      prisma.projectLike.delete({ where: { user_id_project_id: { user_id: userId, project_id: projectId } } }),
      prisma.project.update({ where: { id: projectId }, data: { likes_count: { decrement: 1 } } }),
    ])
    return { liked: false }
  }
  await prisma.$transaction([
    prisma.projectLike.create({ data: { user_id: userId, project_id: projectId } }),
    prisma.project.update({ where: { id: projectId }, data: { likes_count: { increment: 1 } } }),
  ])
  return { liked: true }
}
