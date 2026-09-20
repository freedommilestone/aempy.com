import { ProjectBoard } from "../ProjectBoard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectBoard id={id} />;
}
