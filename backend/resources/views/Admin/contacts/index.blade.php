<x-admin-layout>
    <x-slot name="title">Contact Messages</x-slot>

    <div class="glass-morphism rounded-2xl border border-white/10">
        <div class="p-8">
            <h2 class="text-2xl font-bold gradient-text mb-6">Contact Messages</h2>

            @if(session('success'))
                <div class="mb-6 glass-morphism border-l-4 border-emerald-500 rounded-xl p-4">
                    <p class="text-emerald-300 font-medium">{{ session('success') }}</p>
                </div>
            @endif

            <div class="overflow-x-auto">
                <table class="modern-table w-full">
                    <thead>
                        <tr class="border-b border-slate-700">
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($contacts as $contact)
                            <tr class="border-b border-slate-800/50 hover:bg-cyan-500/5 transition">
                                <td class="px-6 py-4 text-white">{{ $contact->name }}</td>
                                <td class="px-6 py-4 text-slate-300">{{ $contact->email }}</td>
                                <td class="px-6 py-4 text-slate-300">{{ $contact->subject }}</td>
                                <td class="px-6 py-4 text-slate-400">{{ $contact->created_at->format('Y-m-d H:i') }}</td>
                                <td class="px-6 py-4">
                                    <a href="{{ route('admin.contacts.show', $contact) }}" class="text-cyan-400 hover:text-cyan-300 font-semibold transition">View</a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-slate-400">No contact messages found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-6">
                {{ $contacts->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>