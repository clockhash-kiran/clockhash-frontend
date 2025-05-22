"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import CreateOrEditProjectDialog from "./CreateOrEditProjectDialog";
import DeleteProjectDialog from "./DeleteProjectDialog";

export default function ProjectList({
  projects = [], // Set default value as empty array
  onSelect,
  onCreateOrUpdate,
  onDelete,
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Ensure projects is an array before using array methods
  const projectsArray = Array.isArray(projects) ? projects : [];

  const totalPages = Math.ceil(projectsArray.length / pageSize);
  const paginatedProjects = projectsArray.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Your Projects</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            + Add Project
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsArray.length === 0 ? (
              <p className="text-slate-500 italic">No projects found.</p>
            ) : (
              paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={onSelect}
                  onEdit={(p) => {
                    setProjectToEdit(p);
                    setEditDialogOpen(true);
                  }}
                  onDelete={(p) => setProjectToDelete(p)}
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Prev
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditionally render dialogs to reduce render overhead */}
      {createDialogOpen && (
        <CreateOrEditProjectDialog
          open={true}
          onOpenChange={setCreateDialogOpen}
          onCreateSuccess={onCreateOrUpdate}
        />
      )}

      {editDialogOpen && projectToEdit && (
        <CreateOrEditProjectDialog
          open={true}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setProjectToEdit(null);
          }}
          onCreateSuccess={onCreateOrUpdate}
          isEditing
          projectData={projectToEdit}
        />
      )}

      {projectToDelete && (
        <DeleteProjectDialog
          open={true}
          onOpenChange={() => setProjectToDelete(null)}
          project={projectToDelete}
          onConfirm={async () => {
            const id = projectToDelete.id;
            setProjectToDelete(null);
            await onDelete(id);
          }}
        />
      )}
    </>
  );
}
