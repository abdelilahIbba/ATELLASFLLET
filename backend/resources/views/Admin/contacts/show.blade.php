<x-admin-layout>
    <div class="py-10 bg-transparent min-h-screen">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="glass-morphism shadow-lg rounded-xl">
                <div class="p-8 text-white">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-2xl font-semibold">Contact Message</h2>
                        <a href="{{ route('admin.contacts.index') }}" 
                           class="bg-transparent0 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold transition">
                            Back to List
                        </a>
                    </div>

                    <div class="bg-transparent rounded-lg p-8 mb-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p class="text-sm text-gray-600">From:</p>
                                <p class="font-medium">{{ $contact->name }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Email:</p>
                                <p class="font-medium">{{ $contact->email }}</p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-gray-600">Subject:</p>
                                <p class="font-medium">{{ $contact->subject }}</p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-gray-600">Message:</p>
                                <p class="mt-2 whitespace-pre-wrap">{{ $contact->message }}</p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-gray-600">Received on:</p>
                                <p class="font-medium">{{ $contact->created_at->format('F j, Y g:i A') }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 border-t">
                        <form action="{{ route('admin.contacts.destroy', $contact) }}" method="POST" 
                              onsubmit="return confirm('Are you sure you want to delete this message?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" 
                                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition">
                                Delete Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>
