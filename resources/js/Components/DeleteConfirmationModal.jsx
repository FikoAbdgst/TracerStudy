export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    title,
    message,
    confirmText,
    onConfirm,
    loading = false,
    confirmVariant = 'danger',
}) {
    if (!isOpen) return null;

    const confirmColor = confirmVariant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-orange-500 hover:bg-orange-600';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'modalIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">
                        Batal
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${confirmColor}`}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {confirmText}
                            </span>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
