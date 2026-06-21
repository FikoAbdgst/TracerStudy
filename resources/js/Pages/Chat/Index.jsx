import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ conversations }) {
    const { auth } = usePage().props;
    const role = auth.user.roles[0];

    return (
        <AuthenticatedLayout header="Pesan">
            <Head title="Pesan" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {conversations.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Belum ada percakapan</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {role === 'Admin PT'
                                    ? 'Temukan kandidat dan undang mereka melalui fitur Bakat Potensial.'
                                    : role === 'Alumni'
                                    ? 'Lamar pekerjaan atau hubungi Admin Kampus untuk memulai percakapan.'
                                    : 'Belum ada percakapan dengan alumni.'}
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                {role === 'Admin PT' && (
                                    <Link href={route('perusahaan.talent-pool')} className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors">
                                        Cari Kandidat
                                    </Link>
                                )}
                                {role === 'Alumni' && (
                                    <Link href={route('alumni.loker')} className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors">
                                        Lihat Lowongan Kerja
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="font-semibold text-gray-900">Percakapan</h2>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {conversations.map((conv) => (
                                    <li key={conv.id}>
                                        <Link
                                            href={route('chat.show', conv.id)}
                                            className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                                                        {conv.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {conv.other_user?.name || 'Pengguna'}
                                                            </p>
                                                            {conv.other_user?.role === 'Admin PT' && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Perusahaan
                                                                </span>
                                                            )}
                                                            {conv.other_user?.role === 'Alumni' && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                    Alumni
                                                                </span>
                                                            )}
                                                            {conv.other_user?.role === 'Admin Kampus' && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        {conv.last_message && (
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                {conv.last_message.sender_id === conv.other_user?.id ? '' : 'Anda: '}
                                                                {conv.last_message.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                    {conv.unread_count > 0 && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
