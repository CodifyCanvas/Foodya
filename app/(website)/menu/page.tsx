import React, { Suspense } from 'react'
import MenuItemContainer from './menu-items-container'
import { Loader } from 'lucide-react';

const MenuPage = () => {
    return (
        <section id="menu" className="container w-full min-h-[calc(100vh-60px)] px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 flex flex-col text-white font-sans">

            {/* Header Section */}
            <header className="text-left mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                    Our Delicious <span className="text-emerald-500">Menu</span>
                </h2>


                <p className="text-sm sm:text-base md:text-lg mt-3 max-w-2xl text-neutral-200">
                    Explore our wide variety of fresh and tasty food options, crafted to
                    satisfy every craving.
                </p>
            </header>

            {/* Menu Items */}
            <Suspense fallback={
                <div className="flex-1 h-full w-full bg-transparent  flex justify-center items-center">
                    <Loader className="animate-spin size-7 text-gray-500" />
                </div>
            }>
                <MenuItemContainer />
            </Suspense>
        </section>
    );
};

export default MenuPage;