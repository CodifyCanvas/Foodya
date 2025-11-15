import React from 'react'
import MenuItemContainer from './menu-items-container'

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
            <MenuItemContainer />
        </section>
    );
};


export default MenuPage;