<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    |
    | Set some DomPDF specific options.
    |
    */
    'show_warnings' => false,

    'public_path' => null,

    /*
    |--------------------------------------------------------------------------
    | Fonts
    |--------------------------------------------------------------------------
    */
    'font_dir' => storage_path('fonts'),
    'font_cache' => storage_path('fonts'),

    /*
    |--------------------------------------------------------------------------
    | Options
    |--------------------------------------------------------------------------
    */
    'options' => [
        /**
         * The location of the DomPDF font directory
         */
        'font_dir' => storage_path('fonts'),
        'font_cache' => storage_path('fonts'),

        /**
         * pdf_backend can be CPDF (default) or auto
         */
        'pdf_backend' => 'CPDF',

        /**
         * Default paper size (override per-render)
         */
        'default_paper_size' => 'a4',

        /**
         * Whether to enable font subsetting
         * Reduces PDF file size when true
         */
        'enable_font_subsetting' => true,

        /**
         * Whether to enable HTML5 parser
         */
        'enable_html5_parser' => true,

        /**
         * Enable remote file access (for images, etc)
         */
        'isRemoteEnabled' => true,

        /**
         * Enable local PHP file access
         * Needed for @font-face with local TTF paths
         */
        'isPhpEnabled' => false,

        /**
         * Allow DomPDF to read from the filesystem
         */
        'chroot' => [
            base_path(),
            storage_path(),
            public_path(),
        ],

        /**
         * DPI for rendering
         */
        'dpi' => 150,

        /**
         * Default font
         */
        'default_font' => 'dejavu sans',

        /**
         * Enable CSS float support
         */
        'enable_css_float' => true,
    ],
];
