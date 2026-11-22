// ==================================================
// The project the kid joined, its questions and the kid's nickname,
// shared by every screen. Replaces the mock projects/questions lists.
// Signs the kid in (anonymously, no personal info) as soon as the app opens.
// ==================================================
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api";

export type Question = {
    id: string;
    project_id: string;
    position: number;
    type: "checkbox" | "dropdown" | "number" | "text";
    label: string;
    options: string[] | null;
    required: boolean;
};

export type Project = {
    id: string;
    name: string;
    description: string | null;
    is_open: boolean;
};

type ProjectContextType = {
    project: Project | null;
    questions: Question[];
    nickname: string;
    setNickname: (nickname: string) => void;
    // Signs in if needed, joins with the code and loads the questions.
    join: (code: string) => Promise<{ project: Project | null; error: string | null }>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [project, setProject] = useState<Project | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [nickname, setNickname] = useState("");

    // Sign in early so joining is quick. join() checks again in case this failed.
    useEffect(() => {
        api.startKidsSession().then(({ error }) => {
            if (error) console.log("startKidsSession failed:", error.message);
        });
    }, []);

    const join = useCallback(async (code: string) => {
        const session = await api.startKidsSession();
        if (session.error) return { project: null, error: session.error.message };

        const joined = await api.joinProject(code);
        if (joined.error || !joined.data) return { project: null, error: joined.error?.message ?? "Could not join" };
        const joinedProject = joined.data as Project;

        const loaded = await api.getQuestions(joinedProject.id);
        if (loaded.error) return { project: null, error: loaded.error.message };

        setProject(joinedProject);
        setQuestions((loaded.data ?? []).map((q: Omit<Question, "project_id">) => ({ ...q, project_id: joinedProject.id })));
        return { project: joinedProject, error: null };
    }, []);

    return (
        <ProjectContext.Provider value={{ project, questions, nickname, setNickname, join }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useProject must be used inside ProjectProvider");
    return context;
}