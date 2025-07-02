import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-light text-center">
            <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
            <div className="bg-dark text-white px-2 text-sm rounded rotate-12 absolute">
                Page Not Found
            </div>
            <p className="mt-4 text-lg text-gray-600">
                Sorry, the page you are looking for does not exist.
            </p>
            <Link to="/" className="mt-8">
                <Button variant="primary">Go to Homepage</Button>
            </Link>
        </div>
    );
};

export default NotFound;