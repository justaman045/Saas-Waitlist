import { notFound } from "next/navigation"
import { getProjectById } from "@/lib/db-service"
import ProjectForm from "@/components/project-form"

interface EditProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { id } = await params
    const project = await getProjectById(id)

    if (!project) {
        notFound()
    }

    return <ProjectForm initialData={project} />
}
