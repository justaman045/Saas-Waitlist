"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, getCountFromServer, where } from "firebase/firestore";

type Project = {
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    is_active: boolean;
    subscriber_count?: number;
    created_at: any;
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "projects"), orderBy("created_at", "desc"));
                const snapshot = await getDocs(q);

                const projectData = await Promise.all(snapshot.docs.map(async (doc) => {
                    const pData = doc.data();
                    const pEntriesRef = query(collection(db, "waitlist_entries"), where("project_id", "==", doc.id));
                    const pCountSnap = await getCountFromServer(pEntriesRef);
                    return {
                        id: doc.id,
                        ...pData,
                        subscriber_count: pCountSnap.data().count
                    };
                }));

                setProjects(projectData as Project[]);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 bg-background relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-grid-small pointer-events-none" />
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <Link href="/admin" className="text-xs font-mono text-foreground/40 hover:text-foreground/80 transition-colors mb-2 inline-block">
                            ← Back to Mission Control
                        </Link>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                            Projects <span className="text-gradient">Directory.</span>
                        </h1>
                        <p className="text-foreground/60 font-medium max-w-md">
                            A complete registry of all deployed nodes and their current status.
                        </p>
                    </div>
                    <Link
                        href="/admin/new"
                        className="btn-gradient px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                    >
                        <span>+</span> Deploy New Node
                    </Link>
                </div>

                <div className="glass rounded-[2.5rem] overflow-hidden border border-card-border shadow-2xl shadow-black/5">
                    <div className="p-8 border-b border-card-border/50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">All Projects</h2>
                        <div className="px-4 py-1.5 rounded-full bg-secondary/50 border border-secondary text-xs font-mono text-foreground/60">
                            Total: {projects.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-foreground/40 font-mono text-sm animate-pulse">
                                Scanning Network...
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="p-12 text-center text-foreground/40 font-mono text-sm">
                                No projects deployed yet.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-card-border/50 bg-secondary/20">
                                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50 w-[30%]">Identity</th>
                                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50 text-center w-[15%]">Status</th>
                                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50 text-center w-[15%]">Waitlist</th>
                                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50 text-center w-[20%]">Created</th>
                                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50 text-right w-[20%]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border/30">
                                    {projects.map((project) => (
                                        <tr key={project.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg shadow-inner shadow-orange-500/20">
                                                        📦
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                                                            {project.name}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-foreground/40">/{project.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${project.is_active
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
                                                    }`}>
                                                    <span className={`w-1 h-1 rounded-full ${project.is_active ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
                                                    {project.is_active ? "Live" : "Offline"}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="font-mono text-sm font-bold text-foreground">
                                                    {project.subscriber_count || 0}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="text-xs text-foreground/50 font-mono">
                                                    {project.created_at?.seconds ? new Date(project.created_at.seconds * 1000).toLocaleDateString() : "Unknown"}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Link
                                                    href={`/admin/${project.id}`}
                                                    className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-secondary border border-card-border text-xs font-bold text-foreground/70 hover:bg-foreground hover:text-background transition-all"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
