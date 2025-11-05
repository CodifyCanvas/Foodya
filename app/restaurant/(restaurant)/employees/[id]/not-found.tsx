// app/restaurant/(restaurant)/employees/[id]/not-found.tsx

const NotFoundPage = () => {
    return (
        <main className="w-full h-full flex flex-1 bg-card rounded-lg justify-center items-center font-rubik-400 overflow-hidden">
            <div className="flex flex-col-reverse items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
                <h3 className="text-lg text-destructive">Employee Not Found</h3>
                <h1 className="text-9xl font-rubik-800 text-primary p-0 m-0">404</h1>
            </div>
        </main>
    );
}

export default NotFoundPage
