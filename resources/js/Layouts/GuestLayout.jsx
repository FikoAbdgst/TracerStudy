import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

export default function GuestLayout({ children, variant = 'auth' }) {
    const { auth } = usePage().props;

    if (variant === 'landing' && !auth.user) {
        return (
            <div className="min-h-screen bg-white">
                {children}
            </div>
        );
    }

    if (auth.user) {
        return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
