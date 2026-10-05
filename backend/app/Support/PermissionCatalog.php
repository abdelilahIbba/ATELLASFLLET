<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for permissions and default roles.
 * Used by the migration (idempotent sync) and by the seeders.
 */
class PermissionCatalog
{
    public const ACTIONS = ['view', 'create', 'edit', 'delete'];

    /** admin page slug => label */
    public const ADMIN_PAGES = [
        'dashboard'     => 'Tableau de bord',
        'analytics'     => 'Analytique',
        'cars'          => 'Flotte',
        'bookings'      => 'Réservations',
        'contracts'     => 'Contrats',
        'invoices'      => 'Factures',
        'expenses'      => 'Dépenses',
        'clients'       => 'Clients',
        'messages'      => 'Messages',
        'reviews'       => 'Avis',
        'fines'         => 'Amendes',
        'maintenance'   => 'Maintenance',
        'gps'           => 'GPS',
        'blogs'         => 'Blog',
        'testimonials'  => 'Témoignages',
        'pickup_points' => 'Points de retrait',
        'settings'      => 'Paramètres',
        'demo'          => 'Démo',
        'users'         => 'Utilisateurs',
        'roles'         => 'Rôles',
    ];

    /** website key => label */
    public const WEBSITE = [
        'website.bookings.view'   => 'Voir ses réservations',
        'website.bookings.create' => 'Créer une réservation',
        'website.profile.edit'    => 'Modifier son profil',
        'website.reviews.create'  => 'Laisser un avis',
    ];

    /** Frontend admin tab id => admin page slugs it needs. */
    public const TAB_TO_PAGE = [
        'overview'    => ['dashboard'],
        'analytics'   => ['analytics'],
        'fleet'       => ['cars', 'maintenance'],
        'infractions' => ['fines'],
        'bookings'    => ['bookings'],
        'contracts'   => ['contracts', 'invoices'],
        'expenses'    => ['expenses'],
        'clients'     => ['clients'],
        'gps'         => ['gps'],
        'messages'    => ['messages'],
        'reviews'     => ['reviews'],
        'blog'        => ['blogs', 'testimonials'],
        'settings'    => ['settings'],
    ];

    public static function pagesForTabs(array $tabs): array
    {
        $pages = [];
        foreach ($tabs as $tab) {
            foreach (self::TAB_TO_PAGE[$tab] ?? (isset(self::ADMIN_PAGES[$tab]) ? [$tab] : []) as $p) {
                $pages[] = $p;
            }
        }
        return array_values(array_unique($pages));
    }

    public static function all(): array
    {
        $rows = [];
        foreach (self::ADMIN_PAGES as $page => $label) {
            foreach (self::ACTIONS as $action) {
                $rows[] = [
                    'key'    => "admin.$page.$action",
                    'scope'  => 'admin',
                    'page'   => $page,
                    'action' => $action,
                    'label'  => $label,
                ];
            }
        }
        foreach (self::WEBSITE as $key => $label) {
            [, $page, $action] = explode('.', $key);
            $rows[] = ['key' => $key, 'scope' => 'website', 'page' => $page, 'action' => $action, 'label' => $label];
        }
        return $rows;
    }

    public static function keys(): array
    {
        return array_column(self::all(), 'key');
    }

    public static function defaultRoles(): array
    {
        $website = array_keys(self::WEBSITE);
        $adminAll = array_values(array_filter(self::keys(), fn ($k) => str_starts_with($k, 'admin.')));
        $adminNoSecurity = array_values(array_filter(
            $adminAll,
            fn ($k) => !preg_match('/^admin\.(users|roles|demo|settings)\./', $k)
        ));
        $agencyPages = ['dashboard', 'cars', 'bookings', 'contracts', 'invoices', 'clients', 'messages', 'fines', 'maintenance', 'gps', 'pickup_points'];
        $agency = [];
        foreach ($agencyPages as $p) {
            foreach (['view', 'create', 'edit'] as $a) {
                $agency[] = "admin.$p.$a";
            }
        }

        return [
            'super-admin' => [
                'name' => 'Super Admin', 'description' => 'Accès total, rôle protégé.',
                'is_system' => true, 'is_protected' => true, 'admin_access' => true, 'website_access' => true,
                'permissions' => array_merge($adminAll, $website),
            ],
            'admin' => [
                'name' => 'Admin', 'description' => 'Administration de l\'agence (hors utilisateurs et rôles).',
                'is_system' => true, 'is_protected' => false, 'admin_access' => true, 'website_access' => true,
                'permissions' => array_merge($adminNoSecurity, ['admin.settings.view', 'admin.settings.edit'], $website),
            ],
            'employe-agence' => [
                'name' => 'Employé agence', 'description' => 'Employé de l\'agence : opérations quotidiennes.',
                'is_system' => true, 'is_protected' => false, 'admin_access' => true, 'website_access' => true,
                'permissions' => array_merge($agency, $website),
            ],
            'client' => [
                'name' => 'Client', 'description' => 'Client du site web : compte et réservations.',
                'is_system' => true, 'is_protected' => false, 'admin_access' => false, 'website_access' => true,
                'permissions' => $website,
            ],
        ];
    }

    /**
     * Idempotent: inserts missing permissions and default roles; only attaches
     * default permissions to roles created now (never overwrites admin edits),
     * except super-admin which always receives every permission.
     */
    public static function sync(): void
    {
        $now = now();
        foreach (self::all() as $p) {
            $exists = DB::table('permissions')->where('key', $p['key'])->exists();
            if ($exists) {
                DB::table('permissions')->where('key', $p['key'])->update($p + ['updated_at' => $now]);
            } else {
                DB::table('permissions')->insert($p + ['created_at' => $now, 'updated_at' => $now]);
            }
        }
        $permIds = DB::table('permissions')->pluck('id', 'key');

        foreach (self::defaultRoles() as $slug => $def) {
            $existing = DB::table('roles')->where('slug', $slug)->first();
            if ($existing) {
                $roleId = $existing->id;
                $keys = $slug === 'super-admin' ? $def['permissions'] : [];
            } else {
                $roleId = DB::table('roles')->insertGetId([
                    'name' => $def['name'], 'slug' => $slug, 'description' => $def['description'],
                    'is_system' => $def['is_system'], 'is_protected' => $def['is_protected'],
                    'admin_access' => $def['admin_access'], 'website_access' => $def['website_access'],
                    'created_at' => $now, 'updated_at' => $now,
                ]);
                $keys = $def['permissions'];
            }
            foreach ($keys as $key) {
                if (!isset($permIds[$key])) {
                    continue;
                }
                DB::table('role_permission')->insertOrIgnore(['role_id' => $roleId, 'permission_id' => $permIds[$key]]);
            }
        }
    }
}
