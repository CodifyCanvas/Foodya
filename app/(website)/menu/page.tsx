import React from 'react'
import MenuItemContainer from './menu-items-container'

const MenuPage = () => {
    return (
        <section
            id="menu"
            className="mt-10 container sm:mt-0 pt-20 sm:scroll-mt-[100px] w-full min-h-[calc(100vh-60px)] flex flex-col font-sans text-center text-white px-5"
        >
            <div className='w-full text-left'>
                <h2 className="text-4xl text-left sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold leading-tight">
                    Our Delicious <span className="text-emerald-500">Menu</span>
                </h2>
                <p className="text-base text-left sm:text-lg font-sans mb-12">
                    Explore our wide variety of tasty and fresh food options, crafted to satisfy every craving.
                </p>
            </div>

            {/* Menu Items */}
            <MenuItemContainer />

        </section>
    )
}

export default MenuPage