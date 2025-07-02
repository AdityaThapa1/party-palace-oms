import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserTie, FaGlassCheers, FaBirthdayCake, FaRing } from 'react-icons/fa';
import Button from '../../components/common/Button.jsx'; // Assuming this component exists

const HomePage = () => {
    const services = [
        { icon: <FaRing className="h-8 w-8 text-primary" />, title: "Wedding Receptions", description: "Grand wedding halls, exquisite catering, and decor to make your special day unforgettable." },
        { icon: <FaBirthdayCake className="h-8 w-8 text-primary" />, title: "Birthday Parties", description: "Fun, themed decorations and menus for all ages, from kids' parties to milestone celebrations." },
        { icon: <FaGlassCheers className="h-8 w-8 text-primary" />, title: "Corporate Events", description: "Professional setups with audio-visual support for seminars, conferences, and corporate gatherings." }
    ];

    const galleryImages = [
        "/dininghall.png", 
        "/bar.png",
        "/stagesetup.png",
        "/stage.png",
        "/bar2.png",
        "/outdoor.png"
    ];

    return (
        <div className="bg-gray-50 text-dark font-sans">
            {/* 1. Header / Navigation Bar */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="Thapagaun Banquet Logo" className="h-12 w-12 mr-3" />
                        <span className="font-bold text-xl text-dark">Thapagaun Banquet</span>
                    </Link>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <Link to="/customer/login" className="flex flex-col items-center text-gray-600 hover:text-primary transition" title="Customer Portal">
                            <FaUsers className="h-6 w-6"/>
                            <span className="text-xs font-medium">Customer</span>
                        </Link>
                        <Link to="/staff/login" className="flex flex-col items-center text-gray-600 hover:text-primary transition" title="Staff & Admin Portal">
                            <FaUserTie className="h-6 w-6"/>
                             <span className="text-xs font-medium">Staff</span>
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                {/* 2. Hero Section - Showcasing the party palace */}
                <section className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-[85vh]">
                    <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{ backgroundImage: "url('/banner.png')" }}>
                        <span id="blackOverlay" className="w-full h-full absolute opacity-50 bg-black"></span>
                    </div>
                    <div className="container relative mx-auto px-6">
                        <div className="items-center flex flex-wrap">
                            <div className="w-full lg:w-8/12 mx-auto text-center">
                                <h1 className="text-white font-extrabold text-4xl md:text-5xl leading-tight">
                                    Celebrate Life's Most Precious Moments
                                </h1>
                                <p className="mt-4 text-lg md:text-xl text-gray-200">
                                    Thapagaun Banquet offers a luxurious venue, exceptional service, and exquisite catering for your unforgettable events in the heart of Nepal.
                                </p>
                                <div className="mt-8">
                                    <Button as={Link} to="/customer/login" variant="primary" size="sm">
                                        Book Your Event Today
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Services Section */}
                <section id="services" className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">Our Services</h2>
                            <p className="text-gray-600 mt-2">We cater to a wide range of events with professionalism and style.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div key={index} className="p-8 text-center border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-4">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/*Photo Gallery Section */}
                <section id="gallery" className="py-20 bg-light">
                     <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">Our Gallery</h2>
                            <p className="text-gray-600 mt-2">A glimpse into the beautiful events hosted at our palace.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {galleryImages.map((src, index) => (
                               <div key={index} className="overflow-hidden rounded-lg shadow-md">
                                   <img src={src} alt={`Gallery Image ${index + 1}`} className="h-full w-full object-cover aspect-video hover:scale-105 transition-transform duration-300"/>
                               </div>
                           ))}
                        </div>
                    </div>
                </section>

                {/*Testimonial Section */}
                <section id="testimonials" className="py-20 bg-white">
                    <div className="container mx-auto px-6 text-center">
                         <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
                         <div className="max-w-3xl mx-auto">
                            <blockquote className="text-xl italic text-gray-700">
                                "The team at Thapagaun Banquet went above and beyond for our daughter's wedding. The hall was breathtaking, the food was delicious, and the service was impeccable. We couldn't have asked for a better experience!"
                            </blockquote>
                            <p className="mt-4 font-semibold text-dark">- The Shrestha Family</p>
                         </div>
                    </div>
                </section>
            </main>

            {/* Footer Section with Contact Info */}
            <footer id="contact" className="bg-dark text-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
                    <p className="text-gray-400">Ready to plan your event? Get in touch with us today!</p>
                    <div className="mt-6">
                        <p className="text-lg">📞 Phone: <a href="tel:+977-980000000" className="hover:underline">+977-980-000-000X</a></p>
                        <p className="text-lg">📍 Location: Thapagaun, New Baneshwor, Kathmandu, Nepal</p>
                    </div>
                    <p className="text-gray-500 text-sm mt-10">© {new Date().getFullYear()} Thapagaun Banquet. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;