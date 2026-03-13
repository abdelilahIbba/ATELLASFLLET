<x-admin-layout>
    <x-slot name="title">Profile Settings</x-slot>

    <div class="max-w-4xl">
        <div class="space-y-6">
            <div class="glass-morphism rounded-2xl p-8 border border-white/10">
                <div class="max-w-xl">
                    @include('profile.partials.update-profile-information-form')
                </div>
            </div>

            <div class="glass-morphism rounded-2xl p-8 border border-white/10">
                <div class="max-w-xl">
                    @include('profile.partials.update-password-form')
                </div>
            </div>

            <div class="glass-morphism rounded-2xl p-8 border border-white/10">
                <div class="max-w-xl">
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>
