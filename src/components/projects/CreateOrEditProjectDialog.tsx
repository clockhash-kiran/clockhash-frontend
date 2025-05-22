"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

export default function CreateOrEditProjectDialog({
  open,
  onOpenChange,
  onCreateSuccess,
  isEditing = false,
  projectData = null,
}) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setRepoUrl("");
      setWebhookSecret("");
      setLoading(false);
    } else if (isEditing && projectData) {
      setName(projectData.name || "");
      setDescription(projectData.description || "");
      setRepoUrl(projectData.repoUrl || "");
      setWebhookSecret(projectData.webhookSecret || "");
    }
  }, [open, isEditing, projectData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        repoUrl: repoUrl || null,
        webhookSecret: webhookSecret || null,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`/api/projects/${projectData.id}`, payload);
        toast.success("Project updated successfully");
      } else {
        res = await axios.post("/api/projects", {
          ...payload,
          userId: session?.user?.id,
        });
        toast.success("Project created successfully");
      }

      onCreateSuccess(res.data);
      onOpenChange(false);
    } catch (err) {
      console.error("Project save error", err);
      toast.error(`Failed to ${isEditing ? "update" : "create"} project`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your project details"
              : "Add a new project to scan for security vulnerabilities"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
            <Input
              id="webhookSecret"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Secret for webhook authentication"
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditing ? (
                    "Update Project"
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
