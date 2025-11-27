import { fi, id } from "zod/locales";
import { supabase } from "../config/supabase.js";
import { prisma } from "../database/index.js";
import type { Role } from "../types/roles.js";
import jwt from "jsonwebtoken"

class StudentService {
    async registerService(body: { name: string; email: string; password: string; }) {
        const newUser = await prisma.user.create({
            data: body
        })

        const newStudent = await prisma.student.create({
            data: { user: {
                    connect: { id: newUser.id }
                },
            }
        })
        return newStudent
    }

    async getRemindersService(userId: number) {
        const reminders = await prisma.reminder.findMany({
            where: { userId }
        })
        return reminders
    }

    async createReminderService(userId: number, reminderData: Lembrete) {
        const reminder = await prisma.reminder.create({
            data: {
                title: reminderData.titulo,
                description: reminderData.descricao,
                due_date: reminderData.data ?? null,
                user: {
                    connect: { id: userId }
                }
            }
        })
        return reminder
    }

    async createSubjectService(userId: number, name: string) {
        const subject = await prisma.subject.create({
            data: {
                name,
                user: {
                    connect: { id: userId }
                }
            }
        })
        return subject
    }

    async getSubjectsService(userId: number) {
        const subjects = await prisma.subject.findMany({
            where: {
                userId
            }
        })

        return subjects
    }

    async processSummaryRemindersJSON(userId: number, topicId: number, json: ResumosLembretesIA) {
        const summary = json.resumo
        const lembretes = json.lembretes
        const output = []    
        if (lembretes) {
            for (const [key, lembrete] of Object.entries(lembretes)) {
                const title = lembrete.titulo
                const description = lembrete.descricao
                const date = lembrete.data
                const newReminder = await this.createReminderService(userId, lembrete)
                output.push(newReminder)
            }
        }
        const newSummary = await this.createSummaryService(topicId, summary)
        return { output, newSummary }
    }

    async createSummaryService(topicId: number, summary: Resumo) {
        const newSummary = await prisma.summary.create({
            data: {
                title: summary.título,
                content: summary.conteúdo,
                topic: {
                    connect: { id: topicId }
                }
            }
        })

        return newSummary
    }


    async uploadMaterialsService(userId: number, topicId: number, files: Express.Multer.File[]) {
        const fileCount = files.length
        const uploads = files.map(async (file) => {
            const path = `materials/${userId}/${topicId}/${Date.now()}-${file.originalname}`

            const { error } = await supabase.storage
            .from(`EstudaAI-Files`)
            .upload(path, file.buffer, {
                contentType: file.mimetype
            })

            if (error) throw new Error("Erro no upload: " + error.message)

            const { data: publicUrlData } = supabase.storage
            .from("EstudaAI-Files")
            .getPublicUrl(path)

           

            const newFile = await prisma.material.create({
                data: {
                    title: file.originalname,
                    file_type: file.mimetype,
                    public_url: publicUrlData.publicUrl,
                    bucket_path: path,
                    topic: {
                        connect: { id: topicId },
                        
                    },
                    user: {
                        connect: { id: userId }
                    }
                }
            })
            
            return newFile
        })
        await prisma.topic.update({
            where: { id: topicId },
            data: { material_count: { increment: fileCount } }
        })
       return Promise.all(uploads)
    }

    async deleteMaterial(materialId: number) {
        const material = await prisma.material.delete({
            where: { id: materialId }
        })

        const { error } = await supabase.storage
        .from("EstudaAI-Files")
        .remove([material.bucket_path])

        if (error) throw new Error("Could not remove file: " + error.message)

        return material
    }

    async getTopicMaterials(topicId: number) {
        const materialUrls = await prisma.material.findMany({
            where: { topic_id: topicId },
            select: { id: true, public_url: true }
        })

        return materialUrls
    }

    async getTranscripts(topicIds: Array<number>) {
        return Promise.all(topicIds.map(async (id) => {
            return prisma.transcript.findMany({
                where: { material: { topic_id:  id } },
                select: { title: true, content: true }
            })
        }))
    }

    async saveTranscripts(transcripts: Array<TranscriptResponse>, topicId: number) {
        return Promise.all(transcripts.map(async (transcript) => {
            // checks if the transcript already exists
            const exists = await prisma.transcript.findFirst({
                where: { title: transcript.filename }
            })

            if (exists) return { transcript: `Transcript of ${exists.title} and id ${exists.id} already exists`}

            return prisma.transcript.create({
                data: {
                    content: transcript.transcription,
                    title: transcript.filename,
                    topic: {
                        connect: { id: topicId }
                    },
                    material: {
                        connect: { id: transcript.material_id }
                    }
                }
            })
        }))
    }

    async getSubjectTopics(subjectId: number) {
        const topics = await prisma.topic.findMany({
            where: { subject_id: subjectId }
        })

        return topics
    }

    async createTopic(subjectId: number, title: string) {
        return await prisma.topic.create({
            data: {
                title,
                subject: {
                    connect: { id: subjectId }
                }
            }
        })
    }

    async deleteTopic(topicId: number){
        return await prisma.topic.delete({
            where: { id: topicId }
        })
    }

    async getStudyPlans(subjectId: number) {
        return prisma.studyPlan.findMany({
            where: { subject: { id: subjectId } }
        })
    }

    async getStudyPlan(planId: number) {
        return prisma.studyPlan.findUnique({
            where: { id: planId },
            include: {
                study_plan_topics: true,
                study_plans_checklist: true,
                study_plans_complementary: true,
                study_plans_expanded: true
            }
        })
    }

    async processStudyPlanJSON(planData: StudyPlanResponse, userId: number, subjectId: number) {
        const topics = planData.topics
        const expanded = planData.expandedTopics
        const complementary = planData.complementaryTopics
        const checklist = planData.checklist
        const topicsOutput = []
        const expandedOutput = []
        const complementaryOutput = []
        const checklistOutput = []

        const studyPlan = await this.createStudyPlan(planData.title.title, userId, subjectId)

        const planId = studyPlan.id

        for(const [key, topic] of Object.entries(topics)) {
            topicsOutput.push(await this.createStudyPlanTopic(topic, planId))
        }

        for(const [key, expandedTopic] of Object.entries(expanded)) {
            expandedOutput.push(await this.createStudyPlanExpanded(expandedTopic, planId))
        }

        for(const [key, complementaryTopic] of Object.entries(complementary)) {
            complementaryOutput.push(await this.createStudyPlanComplementary(complementaryTopic, planId))
        }

        for(const [key, checklistItem] of Object.entries(checklist)) {
            checklistOutput.push(await this.createStudyPlanChecklist(checklistItem, planId))
        }

        return {
            studyPlan,
            topicsOutput,
            expandedOutput,
            complementaryOutput,
            checklistOutput
        }
    }

    async createStudyPlan(title: string, userId: number, subjectId: number) {
        return await prisma.studyPlan.create({
            data: {
                title,
                user: { connect: { id: userId } },
                subject: { connect: { id: subjectId }}
            }
        })
    }

    async createStudyPlanTopic(topic: StudyPlanTopic, planId: number) {
        return await prisma.studyPlanTopics.create({
            data: {
                title: topic.title,
                order_index: topic.orderIndex,
                study_plan: { connect: { id: planId } }
            }
        })
    }

    async createStudyPlanExpanded(expanded: StudyPlanExpanded, planId: number) {
        return await prisma.studyPlanExpanded.create({
            data: {
                topic_title: expanded.topicTitle,
                order_index: expanded.orderIndex,
                justification: expanded.justification,
                study_plan: { connect: { id: planId } }
            }
        })
    }

    async createStudyPlanComplementary(complementary: StudyPlanComplementary, planId: number) {
        return await prisma.studyPlanComplementary.create({
            data: {
                topic_title: complementary.title,
                description: complementary.description,
                order_index: complementary.orderIndex,
                study_plan: { connect: { id: planId } }
            }
        })
    }

    async createStudyPlanChecklist(checklist: StudyPlanChecklistItem, planId: number) {
        return await prisma.studyPlanChecklistItem.create({
            data: {
                title: checklist.title,
                order_index: checklist.orderIndex,
                description: checklist.description,
                study_plan: { connect: { id: planId } }
            }
        })
    }

    async deleteStudyPlan(planId: number) {
        return await prisma.studyPlan.delete({
            where: { id: planId }
        })
    }
}

export const studentService = new StudentService()