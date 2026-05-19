<?php
/**
 * Winning Trimming child theme functions
 */

// Enqueue parent theme styles
add_action("wp_enqueue_scripts", function() {
    wp_enqueue_style(
        "astra-parent",
        get_template_directory_uri() . "/style.css"
    );
    wp_enqueue_style(
        "winningtrimming-child",
        get_stylesheet_directory_uri() . "/style.css",
        ["astra-parent"],
        wp_get_theme()->get("Version")
    );
});

// Register Projects custom post type
add_action("init", function() {
    register_post_type("project", [
        "labels" => [
            "name"          => "Projects",
            "singular_name" => "Project",
            "add_new"       => "Add New Project",
            "add_new_item"  => "Add New Project",
            "edit_item"     => "Edit Project",
        ],
        "public"        => true,
        "has_archive"   => true,
        "rewrite"       => ["slug" => "projects"],
        "supports"      => ["title", "editor", "thumbnail", "excerpt"],
        "menu_icon"     => "dashicons-portfolio",
        "show_in_rest"  => true,
        "taxonomies"    => ["category"],
    ]);
});

// Register Service Category taxonomy
add_action("init", function() {
    register_taxonomy("service_category", "project", [
        "labels" => [
            "name"          => "Service Categories",
            "singular_name" => "Service Category",
        ],
        "public"        => true,
        "show_in_rest"  => true,
        "rewrite"       => ["slug" => "services"],
        "hierarchical"  => true,
    ]);
});
