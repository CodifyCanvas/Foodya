"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

export default function HeroSection() {

  return (
    <section
      id="home"
      className="mt-10 sm:mt-0 sm:scroll-mt-[100px] w-full min-h-[calc(100vh-60px)] flex flex-col items-center justify-center text-center text-white px-5"
    >

      <div className="w-full mx-auto container flex flex-col md:flex-row gap-8 items-center py-12">
        <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col text-center md:text-left gap-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold leading-tight">
            Order Tasty & Fresh Food <span className="text-emerald-500">anytime!</span>
          </h1>
          <p className="text-base sm:text-lg font-sans">
            Just confirm your order and enjoy our delicious fastest delivery.
          </p>
          <div className="flex justify-center md:justify-start gap-4"> {/* Buttons centered on mobile, left on desktop */}
            <Button>Order Now</Button>
            <Button variant="link" className="cursor-pointer">View Menu</Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-5/12 relative h-auto md:h-96 lg:h-[400px] xl:h-[600px] flex flex-col items-center md:block">
          {/* Avatar Card */}
          <Card
            className="
                                  relative md:absolute md:right-0 md:top-6 
                                  w-fit z-20 text-center 
                                  px-4 py-5 flex flex-col items-center gap-2 
                                  bg-white/5 backdrop-blur-md
                                  border-white/20
                                "
          >
            <p className="font-sans text-sm font-semibold text-white">
              Our Happy Customers
            </p>

            <AvatarGroup className="justify-center mt-2">
              <Avatar>
                <AvatarImage src="https://picsum.photos/100/100?random=1" alt="User 1" />
                <AvatarFallback className="bg-indigo-500 text-white">CN</AvatarFallback>
              </Avatar>
              <Avatar className="border-red-400">
                <AvatarImage className="border-red-400" src="https://picsum.photos/100/100?random=2" alt="User 2" />
                <AvatarFallback className="bg-green-600 text-white">AB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://picsum.photos/100/100?random=3" alt="User 3" />
                <AvatarFallback className="bg-red-500 text-white">VK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://picsum.photos/100/100?random=4" alt="User 4" />
                <AvatarFallback className="bg-orange-500 text-white">RS</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://picsum.photos/100/100?random=4" alt="User 4" />
                <AvatarFallback className="bg-orange-500 text-white">RS</AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </Card>

          {/* Hero Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-full">
            <Image
              src="/images/landing_page_hero.png"
              alt="Hero Section Image"
              fill
              className="object-contain rounded"
              priority
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center flex-wrap gap-16">

        {/* <MenuItemCard /> */}

        <div className="flex flex-col w-20 gap-4 justify-center">
          <Button className="inline-flex items-center justify-center w-10 p-3 bg-neutral-900 group rounded-full hover:w-20 cursor-pointer transition-all duration-300 overflow-hidden">
            <span className="relative flex items-center transition-all duration-300">
              <ArrowRight className="text-white transition-all duration-300 group-hover:translate-x-1" />
              <span className="absolute right-[4px] h-[2px] w-0 bg-white rounded-full transition-all duration-300 group-hover:w-3"></span>
            </span>
          </Button>

          <Button className="inline-flex items-center justify-center w-10 p-3 bg-neutral-900 group rounded-full hover:w-20 cursor-pointer transition-all duration-300 overflow-hidden">
            <span className="relative flex items-center transition-all duration-300">
              <ArrowLeft className="text-white transition-all duration-300 group-hover:-translate-x-1" />
              <span className="absolute left-[4px] h-[2px] w-0 bg-white rounded-full transition-all duration-300 group-hover:w-3"></span>
            </span>
          </Button>

        </div>
      </div>
    </section>
  );
}

// const MenuItemCard = ({ items }: any) => {

//   return (
//     <>
//       {items.map((item, idx) => (
//         <Card
//           key={idx}
//           className="relative w-[17rem] border-neutral-700/70 overflow-visible rounded-xl bg-neutral-900/90 text-white p-4 backdrop-blur-sm shadow-xl hover:shadow-emerald-600/25 transition-all duration-300 hover:border-emerald-500/70"
//         >
//           {/* Top accent line */}
//           <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/75 to-transparent opacity-80 transition-all duration-300 group-hover:via-emerald-500" />

//           {/* Floating Product Image */}
//           <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-28 h-28 z-10">
//             <div className="relative w-28 h-28 group-hover:scale-105 transition-transform duration-300">
//               <div className="absolute inset-0 bg-emerald-600/20 rounded-full blur-lg"></div>
//               <div className="relative w-full h-full rounded-full overflow-hidden ring-emerald-400/40 group-hover:ring-emerald-300/75 ring-2 shadow-lg shadow-emerald-600/25 transition-all duration-300">
//                 <Image
//                   src={item.image}
//                   alt={item.name}
//                   fill
//                   className="object-cover rounded-full"
//                   loading="lazy"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Product Info */}
//           <CardContent className="space-y-3 p-0">
//             <h3 className="text-lg font-semibold pl-7">{item.name}</h3>

//             {/* Rating & Price */}
//             <div className="flex items-center justify-between pl-14 w-full">
//               <div className="flex gap-1">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Star key={i} className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
//                 ))}
//               </div>
//               <span className="text-orange-500 font-semibold text-lg">{item.price}</span>
//             </div>

//             {/* Sizes */}
//             <div className="grid grid-cols-3 gap-2 text-sm">
//               {item.sizes.map((size, i) => (
//                 <p key={i} className="font-semibold flex flex-col text-white/50 text-sm group hover:underline">
//                   {size.label}
//                   <span className="text-white/75 group-hover:text-white transition-colors duration-200">
//                     {size.price}
//                   </span>
//                 </p>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </>
//   );
// };