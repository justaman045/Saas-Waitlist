export function Background() {
    return (
        <div className="fixed inset-0 z-[-1] h-full w-full bg-background pointer-events-none">
            <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div>
            <div className="absolute bottom-auto left-0 right-auto top-0 h-[500px] w-[500px] -translate-y-[10%] rounded-full bg-indigo-500/20 opacity-50 blur-[80px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
    )
}
