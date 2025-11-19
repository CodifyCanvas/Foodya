import React, { Suspense } from 'react'
import AboutPage from './about-page'
import { Loader } from 'lucide-react'

const Page = async ({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) => {
    return (
        <Suspense fallback={
            <div className="flex-1 h-full w-full bg-transparent  flex justify-center items-center">
                <Loader className="animate-spin size-7 text-gray-500" />
            </div>
        }>
            <AboutPage searchParams={searchParams} />
        </Suspense>
    )
}

export default Page