import { Link } from "react-router-dom";
import type { Project } from "../../types";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {projects.map((project) => (
        <Link key={project.id} to={`/project/${project.id}`}>
          <div className="cursor-pointer">
            <ProjectCard key={project.id} project={project} />
          </div>
        </Link>
      ))}
    </div>
  );
}
