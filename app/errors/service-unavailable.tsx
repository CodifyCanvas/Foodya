import React from 'react'

const ServiceUnavailable = ({title, statusCode, description}:{title: string, statusCode?: string | number, description: string}) => {
  return (
    <main className="w-full h-full flex flex-1 bg-white rounded-lg justify-center items-center font-rubik-400">
      <div className="flex flex-col items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
        <h3 className="text-lg">{title}</h3>
        {statusCode && <h1 className="text-9xl font-rubik-800 text-emerald-600 p-0 m-0">{statusCode}</h1>}
        <h3 className="text-lg text-red-500">{description}</h3>
      </div>
    </main>
  )
}

export default ServiceUnavailable