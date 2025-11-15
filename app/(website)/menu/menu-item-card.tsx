import { Card, CardContent } from '@/components/ui/card';
import { ItemWithOptions, MenuItemOptions } from '@/lib/definations';
import { Star } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

const MenuItemCard = ({ data }: { data: ItemWithOptions }) => {

    const rating = 4 + (data?.id % 2)

    return (
        <>
            <div className='relative w-[17rem] group z-0 p-0 m-0'>

                {/* Top Catogary */}
                <div className={`
                          overflow-hidden
                          flex items-center justify-center
                          text-neutral-900 font-semibold
                          h-7 py-0 pl-8 pr-3 min-w-26 max-w-44
                          transition-all duration-500
                          ${data?.is_available ? 'bg-emerald-500' : 'bg-neutral-400'} text-sm absolute
                          -z-10 right-5 top-0
                          group-hover:-translate-y-6 opacity-0 group-hover:opacity-100
                          [clip-path:polygon(25%_0%,100%_0%,100%_100%,0%_100%)]
                          rounded-tr-sm
                        `}
                >
                    <p className="text-center leading-10">{data?.category || 'title'}</p>
                </div>

                {/* Top accent line */}
                <div className={`absolute top-0 left-0 z-10 right-0 h-0.5 bg-gradient-to-r from-transparent ${data?.is_available ? 'via-emerald-500/75 group-hover:via-emerald-500' : 'via-neutral-500/75 group-hover:via-neutral-500'} to-transparent opacity-80 transition-all duration-300`} />

                {/* Floating Product Image */}
                <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-28 h-28 z-10">
                    <div className="absolute inset-0 bg-emerald-600/20 rounded-full blur-lg" />
                    <div className="relative w-full ring-emerald-400/40 group-hover:ring-emerald-300/75 ring-2 rounded-full p-3 h-full group-hover:scale-105 transition-all duration-300">
                        <div className="relative w-full h-full rounded-full overflow-hidden  shadow-lg shadow-emerald-600/25 transition-all duration-300">
                            <Image
                                src={data?.image ?? '/images/placeholder-image.jpg'}
                                alt={'Menu Item Image'}
                                fill
                                sizes="(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px"
                                className="object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                <Card tabIndex={0} className={`relative w-[17rem]  group border-neutral-700/70 overflow-visible rounded-xl z-0 bg-neutral-900/90 text-white p-4 backdrop-blur-sm shadow-xl hover:shadow-emerald-600/25 transition-all duration-300 ${data?.is_available ? 'hover:border-emerald-500/70' : 'hover:border-neutral-500/70'}`}>

                    {/* Product Info */}
                    <CardContent className="p-0">
                        <h3 className="text-lg text-left font-semibold ml-16">{data?.item}</h3>

                        {/* Rating & Price */}
                        <div className="flex items-center justify-between pl-14 w-full py-3">
                            <div className="flex gap-1">
                                {Array.from({ length: rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
                                ))}
                            </div>
                            <span className="text-orange-500 font-semibold text-lg">${data?.price}</span>
                        </div>

                        {/* Sizes / Variants */}
                        {data?.options.length > 0 && (
                            <div
                                className="
                                  max-h-0 
                                  group-hover:max-h-72
                                  group-has-[:focus]:max-h-72
                                  overflow-y-auto
                                  overflow-x-hidden
                                  transition-all duration-500 ease-in-out
                                  scroll-bar
                                  px-2
                                "
                            >
                                <table className="w-full mt-2 text-sm opacity-0 group-hover:opacity-100 group-has-[:focus]:opacity-100  transition-opacity duration-500">
                                    <tbody>
                                        {data.options.map((size: MenuItemOptions) => (
                                            <tr
                                                key={size.option_id}
                                                className="border-b border-neutral-700/40 last:border-0"
                                            >
                                                <td className="py-1 pr-2 font-semibold text-left text-white/80">
                                                    {size.option_name}
                                                </td>
                                                <td className="py-1 text-orange-400 text-right font-bold">
                                                    ${size.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default MenuItemCard