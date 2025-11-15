"use client"

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";

export default function HeroSection() {

  return (
    <section
      id="home"
      className="mt-10 sm:mt-0 sm:scroll-mt-[100px] w-full min-h-[calc(100vh-21vh)] flex flex-col items-center justify-center text-center text-white px-5"
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              className="object-contain rounded"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}