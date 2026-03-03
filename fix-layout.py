import re

file_path = "app/projects/[slug]/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Extract from top to link
top_part = text.split('<div className="grid gap-12 lg:grid-cols-[1fr_380px] items-start">')[0]

replacement = '''                <div className="flex flex-col gap-10 mb-16">
                    {/* Header */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/60">
                                    {project.title}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`h-7 px-3 border ${project.status === "active"
                                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                        : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                                        }`}
                                >
                                    {project.status === "active" ? "Live" : "Coming Soon"}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <CalendarDays className="h-4 w-4 text-primary/70" />
                                    <span>Launched {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                                </div>
                                {project.waitlistCount !== undefined && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <Users className="h-4 w-4 text-primary/70" />
                                        <span>{project.waitlistCount} people waiting</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div className="relative group w-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative aspect-video xl:aspect-[21/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm">
                            {/* Browser Chrome */}
                            <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                                <div className="ml-4 flex-1 h-6 bg-black/20 rounded-md border border-white/5 flex items-center px-3 text-[10px] text-muted-foreground font-mono truncate">
                                    {project.websiteUrl || `https://${project.slug}.saaswaitlist.com`}
                                </div>
                            </div>
                            {/* Content */}
                            {project.imageUrl || (project.images && project.images.length > 0) ? (
                                <ImageGallery
                                    images={project.images && project.images.length > 0 ? project.images : [project.imageUrl!]}
                                    title={project.title}
                                />
                            ) : (
                                <div className="p-10 flex items-center justify-center h-[calc(100%-40px)] bg-gradient-to-br from-black/50 to-black/80">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center border border-white/10 backdrop-blur-md">
                                            <span className="text-2xl">⚡️</span>
                                        </div>
                                        <p className="text-muted-foreground font-medium">Project Demo Preview</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] items-start">
                    {/* Main Content Details */}
                    <div className="flex flex-col gap-12 w-full min-w-0">
                        {/* Description */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 lg:p-14 backdrop-blur-md shadow-xl overflow-hidden">
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary/80 rounded-full"></span>
                                About the Project
                            </h2>
                            <div className="prose prose-invert lg:prose-xl max-w-none 
                                prose-headings:text-white/90 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                                prose-p:text-slate-300 prose-p:leading-relaxed 
                                prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-white prose-strong:font-semibold
                                prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-8
                                [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[14px] [&_li]:before:h-2 [&_li]:before:w-2 [&_li]:before:rounded-full [&_li]:before:bg-primary/80
                                prose-table:w-full prose-table:border-collapse prose-table:my-10 block overflow-x-auto
                                prose-th:bg-white/5 prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-white prose-th:border prose-th:border-white/10
                                prose-td:px-6 prose-td:py-4 prose-td:border prose-td:border-white/5 prose-td:text-slate-300
                                prose-tr:border-b prose-tr:border-white/5 hover:prose-tr:bg-white/[0.02] transition-colors
                                prose-blockquote:border-l-primary prose-blockquote:bg-white/5 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-300
                                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-white/5"
                            >
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{project.description}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent p-8 md:p-12 lg:p-14 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
                                <h3 className="mb-10 text-3xl font-bold text-white flex items-center gap-4">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 text-primary text-xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]">✨</span>
                                    Key Features
                                </h3>
                                <ul className="flex flex-col gap-6">
                                    {project.features.map((feature: string, i: number) => (
                                        <li key={i} className="group relative flex items-start gap-6 p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all duration-300">
                                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="mt-2 h-4 w-4 rounded-full bg-primary/80 shrink-0 shadow-[0_0_12px_rgba(var(--primary),0.6)] group-hover:scale-110 transition-transform" />
                                            <span className="text-lg text-slate-300 group-hover:text-white/90 leading-relaxed transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>'''

sidebar_extract = text.split('{/* Sidebar */}')[1].split('                {/* Full Width Bottom Content */}')[0]

new_content = top_part + replacement + "\n\n                    {/* Sidebar */}" + sidebar_extract + '''                </div>
            </div>
        </div>
    )
}
'''

with open(file_path, "w") as f:
    f.write(new_content)
