import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_appearance" AS ENUM('default', 'outline', 'ghost', 'link');
  CREATE TYPE "public"."enum_pages_blocks_hero_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_hero_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_hero_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_display" AS ENUM('marquee', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_links_link_appearance" AS ENUM('link', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_layout" AS ENUM('stacked', 'visual-right', 'visual-left');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_prompts_chart" AS ENUM('line', 'bars', 'donut', 'none');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_steps_steps_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_steps_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_steps_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_steps_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_integrations_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_integrations_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_integrations_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_integrations_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_integrations_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_integrations_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_integrations_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_request_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_pillars_pillars_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_pillars_tiles_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_pillars_tiles_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum_pages_blocks_pillars_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_pillars_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_pillars_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_size" AS ENUM('sm', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_layout" AS ENUM('grid-3', 'grid-4', 'bento');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_stats_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_stats_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_stats_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_plans_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_plans_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_links_link_appearance" AS ENUM('link', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_pricing_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_pricing_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_pricing_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_faq_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_layout" AS ENUM('banner', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_document_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_document_binding_language" AS ENUM('none', 'de', 'en');
  CREATE TYPE "public"."enum_pages_blocks_document_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_document_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_links_link_appearance" AS ENUM('default', 'outline', 'ghost', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_display" AS ENUM('marquee', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_links_link_appearance" AS ENUM('link', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_layout" AS ENUM('stacked', 'visual-right', 'visual-left');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_prompts_chart" AS ENUM('line', 'bars', 'donut', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_steps_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_request_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_pillars_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_tiles_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_tiles_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_size" AS ENUM('sm', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_layout" AS ENUM('grid-3', 'grid-4', 'bento');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_plans_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_plans_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_links_link_appearance" AS ENUM('link', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_layout" AS ENUM('banner', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_document_header_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_document_binding_language" AS ENUM('none', 'de', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_document_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_document_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_sidebars_groups_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_site_settings_social_platform" AS ENUM('linkedin', 'discord', 'instagram', 'youtube', 'facebook', 'x');
  CREATE TYPE "public"."enum_header_items_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_items_columns_links_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_header_items_type" AS ENUM('link', 'menu');
  CREATE TYPE "public"."enum_header_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_items_featured_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_announcement_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_secondary_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_primary_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_subneo_pricing_families_role" AS ENUM('app', 'addon');
  CREATE TYPE "public"."enum_subneo_pricing_source" AS ENUM('subneo', 'fixture');
  CREATE TYPE "public"."enum_consent_categories_services_integration" AS ENUM('none', 'gtm');
  CREATE TYPE "public"."enum_consent_categories_key" AS ENUM('necessary', 'analytics', 'marketing');
  CREATE TYPE "public"."enum_consent_trigger_mode" AS ENUM('link', 'floating');
  CREATE TYPE "public"."enum_consent_trigger_position" AS ENUM('bottom-left', 'bottom-right');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_hero_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_trust_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_hero_header_align" DEFAULT 'left',
  	"visual_type" "enum_pages_blocks_hero_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_hero_visual_illustration" DEFAULT 'stage',
  	"visual_image_id" integer,
  	"settings_background" "enum_pages_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_hero_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"trust_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_logo_wall_header_align" DEFAULT 'left',
  	"display" "enum_pages_blocks_logo_wall_display" DEFAULT 'marquee',
  	"settings_background" "enum_pages_blocks_logo_wall_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_logo_wall_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_wall_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_tabs_tabs_points_icon"
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_feature_tabs_tabs_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_feature_tabs_tabs_links_link_appearance" DEFAULT 'link'
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_tabs_tabs_icon",
  	"visual_type" "enum_pages_blocks_feature_tabs_tabs_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_feature_tabs_tabs_visual_illustration" DEFAULT 'dashboard',
  	"visual_image_id" integer
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_feature_tabs_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_feature_tabs_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_feature_tabs_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_story_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_story_points_icon"
  );
  
  CREATE TABLE "pages_blocks_feature_story_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_story_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_feature_story_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_feature_story_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_feature_story_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_feature_story_header_align" DEFAULT 'left',
  	"layout" "enum_pages_blocks_feature_story_layout" DEFAULT 'stacked',
  	"visual_type" "enum_pages_blocks_feature_story_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_feature_story_visual_illustration" DEFAULT 'builder',
  	"visual_image_id" integer,
  	"settings_background" "enum_pages_blocks_feature_story_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_feature_story_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_story_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_prompts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"chart" "enum_pages_blocks_agent_showcase_prompts_chart" DEFAULT 'line',
  	"kpi_value" varchar,
  	"kpi_delta" varchar
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_prompts_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"kpi_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_agent_showcase_points_icon"
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_agent_showcase_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_agent_showcase_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_agent_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_agent_showcase_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_agent_showcase_settings_background" DEFAULT 'dark',
  	"settings_spacing" "enum_pages_blocks_agent_showcase_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_agent_showcase_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_steps_steps_icon"
  );
  
  CREATE TABLE "pages_blocks_steps_steps_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_steps_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_steps_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_steps_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integrations_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_integrations_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integrations_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integrations_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_integrations_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_integrations_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_integrations_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_integrations_header_align" DEFAULT 'left',
  	"visual_type" "enum_pages_blocks_integrations_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_integrations_visual_illustration" DEFAULT 'integrations',
  	"visual_image_id" integer,
  	"settings_background" "enum_pages_blocks_integrations_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum_pages_blocks_integrations_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_integrations_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_integration_directory_header_align" DEFAULT 'left',
  	"request_link_type" "enum_pages_blocks_integration_directory_request_link_type" DEFAULT 'reference',
  	"request_link_new_tab" boolean,
  	"request_link_url" varchar,
  	"settings_background" "enum_pages_blocks_integration_directory_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_integration_directory_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_integration_directory_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"request_title" varchar DEFAULT 'Ihr System fehlt?',
  	"request_text" varchar,
  	"request_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pillars_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_pillars_pillars_icon"
  );
  
  CREATE TABLE "pages_blocks_pillars_pillars_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pillars_tiles_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_pillars_tiles_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_pillars_tiles_links_link_appearance" DEFAULT 'link'
  );
  
  CREATE TABLE "pages_blocks_pillars_tiles_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pillars_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"suffix" varchar
  );
  
  CREATE TABLE "pages_blocks_pillars_tiles_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_pillars_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_pillars_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_pillars_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pillars_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_card_grid_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_card_grid_cards_links_link_appearance" DEFAULT 'link'
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_card_grid_cards_icon",
  	"size" "enum_pages_blocks_card_grid_cards_size" DEFAULT 'sm'
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_card_grid_header_align" DEFAULT 'left',
  	"layout" "enum_pages_blocks_card_grid_layout" DEFAULT 'grid-4',
  	"settings_background" "enum_pages_blocks_card_grid_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_card_grid_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"suffix" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items_locales" (
  	"label" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_stats_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_stats_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum_pages_blocks_stats_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"company" varchar,
  	"avatar_id" integer,
  	"logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonials_items_locales" (
  	"quote" varchar,
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_testimonials_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_testimonials_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_testimonials_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_pricing_teaser_plans_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_pricing_teaser_plans_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"highlighted" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_plans_locales" (
  	"period" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_pricing_teaser_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_pricing_teaser_links_link_appearance" DEFAULT 'link'
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_pricing_teaser_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_pricing_teaser_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum_pages_blocks_pricing_teaser_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_teaser_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"footnote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_families" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_pricing_header_align" DEFAULT 'left',
  	"show_cards" boolean DEFAULT true,
  	"show_addons" boolean DEFAULT true,
  	"show_comparison" boolean DEFAULT true,
  	"settings_background" "enum_pages_blocks_pricing_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_pricing_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"addons_header_heading" varchar,
  	"addons_header_lead" varchar,
  	"comparison_header_heading" varchar,
  	"comparison_header_lead" varchar,
  	"footnote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_faq_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_faq_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_section_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_section_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_cta_section_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_section_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_cta_section_header_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_cta_section_settings_background" DEFAULT 'dark',
  	"settings_spacing" "enum_pages_blocks_cta_section_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_section_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_spotlight_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_spotlight_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_spotlight_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_spotlight_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_spotlight_layout" DEFAULT 'banner',
  	"settings_background" "enum_pages_blocks_spotlight_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_spotlight_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_document_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_blocks_document_history_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"header_align" "enum_pages_blocks_document_header_align" DEFAULT 'left',
  	"sidebar_id" integer,
  	"meta_last_updated" timestamp(3) with time zone,
  	"meta_effective_from" timestamp(3) with time zone,
  	"meta_version" varchar,
  	"binding_language" "enum_pages_blocks_document_binding_language" DEFAULT 'de',
  	"show_toc" boolean DEFAULT true,
  	"settings_background" "enum_pages_blocks_document_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_document_settings_spacing" DEFAULT 'none',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_document_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'none',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"seo_title" varchar,
  	"seo_image_id" integer,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_trust_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_hero_header_align" DEFAULT 'left',
  	"visual_type" "enum__pages_v_blocks_hero_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_hero_visual_illustration" DEFAULT 'stage',
  	"visual_image_id" integer,
  	"settings_background" "enum__pages_v_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_hero_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"trust_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_logo_wall_header_align" DEFAULT 'left',
  	"display" "enum__pages_v_blocks_logo_wall_display" DEFAULT 'marquee',
  	"settings_background" "enum__pages_v_blocks_logo_wall_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_logo_wall_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_tabs_tabs_points_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_feature_tabs_tabs_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_feature_tabs_tabs_links_link_appearance" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_tabs_tabs_icon",
  	"visual_type" "enum__pages_v_blocks_feature_tabs_tabs_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_feature_tabs_tabs_visual_illustration" DEFAULT 'dashboard',
  	"visual_image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_feature_tabs_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_feature_tabs_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_feature_tabs_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_story_points_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_feature_story_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_feature_story_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_feature_story_header_align" DEFAULT 'left',
  	"layout" "enum__pages_v_blocks_feature_story_layout" DEFAULT 'stacked',
  	"visual_type" "enum__pages_v_blocks_feature_story_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_feature_story_visual_illustration" DEFAULT 'builder',
  	"visual_image_id" integer,
  	"settings_background" "enum__pages_v_blocks_feature_story_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_feature_story_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_story_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_prompts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"chart" "enum__pages_v_blocks_agent_showcase_prompts_chart" DEFAULT 'line',
  	"kpi_value" varchar,
  	"kpi_delta" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_prompts_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"kpi_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_agent_showcase_points_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_agent_showcase_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_agent_showcase_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_agent_showcase_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_agent_showcase_settings_background" DEFAULT 'dark',
  	"settings_spacing" "enum__pages_v_blocks_agent_showcase_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_agent_showcase_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_steps_steps_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_steps_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_steps_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_steps_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_steps_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_integrations_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_integrations_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_integrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_integrations_header_align" DEFAULT 'left',
  	"visual_type" "enum__pages_v_blocks_integrations_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_integrations_visual_illustration" DEFAULT 'integrations',
  	"visual_image_id" integer,
  	"settings_background" "enum__pages_v_blocks_integrations_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum__pages_v_blocks_integrations_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integrations_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_integration_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_integration_directory_header_align" DEFAULT 'left',
  	"request_link_type" "enum__pages_v_blocks_integration_directory_request_link_type" DEFAULT 'reference',
  	"request_link_new_tab" boolean,
  	"request_link_url" varchar,
  	"settings_background" "enum__pages_v_blocks_integration_directory_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_integration_directory_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integration_directory_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"request_title" varchar DEFAULT 'Ihr System fehlt?',
  	"request_text" varchar,
  	"request_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_pillars_pillars_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_pillars_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_tiles_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_pillars_tiles_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_pillars_tiles_links_link_appearance" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_tiles_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"suffix" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_tiles_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_pillars_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_pillars_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_pillars_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pillars_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_card_grid_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_card_grid_cards_links_link_appearance" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_card_grid_cards_icon",
  	"size" "enum__pages_v_blocks_card_grid_cards_size" DEFAULT 'sm',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_card_grid_header_align" DEFAULT 'left',
  	"layout" "enum__pages_v_blocks_card_grid_layout" DEFAULT 'grid-4',
  	"settings_background" "enum__pages_v_blocks_card_grid_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_card_grid_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"suffix" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items_locales" (
  	"label" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_stats_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_stats_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum__pages_v_blocks_stats_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"company" varchar,
  	"avatar_id" integer,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items_locales" (
  	"quote" varchar,
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_testimonials_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_testimonials_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_testimonials_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_pricing_teaser_plans_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_pricing_teaser_plans_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"highlighted" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_plans_locales" (
  	"period" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_pricing_teaser_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_pricing_teaser_links_link_appearance" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_pricing_teaser_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_pricing_teaser_settings_background" DEFAULT 'tinted',
  	"settings_spacing" "enum__pages_v_blocks_pricing_teaser_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_teaser_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"footnote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_families" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_pricing_header_align" DEFAULT 'left',
  	"show_cards" boolean DEFAULT true,
  	"show_addons" boolean DEFAULT true,
  	"show_comparison" boolean DEFAULT true,
  	"settings_background" "enum__pages_v_blocks_pricing_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_pricing_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"addons_header_heading" varchar,
  	"addons_header_lead" varchar,
  	"comparison_header_heading" varchar,
  	"comparison_header_lead" varchar,
  	"footnote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_faq_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_faq_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta_section_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_section_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_section_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_section_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_cta_section_header_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_cta_section_settings_background" DEFAULT 'dark',
  	"settings_spacing" "enum__pages_v_blocks_cta_section_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_section_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_spotlight_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_spotlight_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_spotlight_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spotlight_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__pages_v_blocks_spotlight_layout" DEFAULT 'banner',
  	"settings_background" "enum__pages_v_blocks_spotlight_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_spotlight_settings_spacing" DEFAULT 'default',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_document_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_document_history_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_align" "enum__pages_v_blocks_document_header_align" DEFAULT 'left',
  	"sidebar_id" integer,
  	"meta_last_updated" timestamp(3) with time zone,
  	"meta_effective_from" timestamp(3) with time zone,
  	"meta_version" varchar,
  	"binding_language" "enum__pages_v_blocks_document_binding_language" DEFAULT 'de',
  	"show_toc" boolean DEFAULT true,
  	"settings_background" "enum__pages_v_blocks_document_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_document_settings_spacing" DEFAULT 'none',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_document_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'none',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_seo_title" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sidebars_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_sidebars_groups_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "sidebars_groups_links_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sidebars_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "sidebars_groups_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sidebars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"contact_enabled" boolean DEFAULT false,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sidebars_locales" (
  	"contact_title" varchar,
  	"contact_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sidebars_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "consent_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"consent_id" varchar NOT NULL,
  	"revision" numeric NOT NULL,
  	"choices" jsonb NOT NULL,
  	"decided_at" timestamp(3) with time zone NOT NULL,
  	"texts_hash" varchar,
  	"locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"pages_find" boolean DEFAULT false,
  	"pages_create" boolean DEFAULT false,
  	"pages_update" boolean DEFAULT false,
  	"posts_find" boolean DEFAULT false,
  	"posts_create" boolean DEFAULT false,
  	"posts_update" boolean DEFAULT false,
  	"media_find" boolean DEFAULT false,
  	"categories_find" boolean DEFAULT false,
  	"categories_create" boolean DEFAULT false,
  	"categories_update" boolean DEFAULT false,
  	"site_settings_find" boolean DEFAULT false,
  	"site_settings_update" boolean DEFAULT false,
  	"header_find" boolean DEFAULT false,
  	"header_update" boolean DEFAULT false,
  	"footer_find" boolean DEFAULT false,
  	"footer_update" boolean DEFAULT false,
  	"subneo_pricing_find" boolean DEFAULT false,
  	"subneo_pricing_update" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"sidebars_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"consent_logs_id" integer,
  	"payload_mcp_api_keys_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Indicate Data' NOT NULL,
  	"logo_id" integer,
  	"logo_dark_id" integer,
  	"og_image_id" integer,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_address" varchar,
  	"links_app_url" varchar,
  	"links_demo_url" varchar,
  	"links_help_url" varchar,
  	"links_docs_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "header_items_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_items_columns_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"icon" "enum_header_items_columns_links_icon"
  );
  
  CREATE TABLE "header_items_columns_links_locales" (
  	"link_label" varchar,
  	"description" varchar,
  	"badge" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_items_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "header_items_columns_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_header_items_type" DEFAULT 'link',
  	"link_type" "enum_header_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"featured_enabled" boolean DEFAULT false,
  	"featured_link_type" "enum_header_items_featured_link_type" DEFAULT 'reference',
  	"featured_link_new_tab" boolean,
  	"featured_link_url" varchar
  );
  
  CREATE TABLE "header_items_locales" (
  	"label" varchar NOT NULL,
  	"featured_title" varchar,
  	"featured_text" varchar,
  	"featured_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement_enabled" boolean DEFAULT false,
  	"announcement_link_type" "enum_header_announcement_link_type" DEFAULT 'reference',
  	"announcement_link_new_tab" boolean,
  	"announcement_link_url" varchar,
  	"secondary_cta_enabled" boolean DEFAULT true,
  	"secondary_cta_link_type" "enum_header_secondary_cta_link_type" DEFAULT 'reference',
  	"secondary_cta_link_new_tab" boolean,
  	"secondary_cta_link_url" varchar,
  	"primary_cta_enabled" boolean DEFAULT true,
  	"primary_cta_link_type" "enum_header_primary_cta_link_type" DEFAULT 'reference',
  	"primary_cta_link_new_tab" boolean,
  	"primary_cta_link_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_locales" (
  	"announcement_text" varchar,
  	"announcement_link_label" varchar,
  	"secondary_cta_link_label" varchar,
  	"primary_cta_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer_legal_links_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_contact" boolean DEFAULT true,
  	"show_language_switch" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"bottom_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "subneo_pricing_families_highlight_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature_code" varchar NOT NULL
  );
  
  CREATE TABLE "subneo_pricing_families" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"role" "enum_subneo_pricing_families_role" DEFAULT 'app' NOT NULL,
  	"featured_plan_code" varchar,
  	"show_in_comparison" boolean DEFAULT true
  );
  
  CREATE TABLE "subneo_pricing_families_locales" (
  	"label" varchar,
  	"lead" varchar,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subneo_pricing_plan_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plan_code" varchar NOT NULL,
  	"cta_url" varchar,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "subneo_pricing_plan_overrides_locales" (
  	"name" varchar,
  	"tagline" varchar,
  	"badge" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subneo_pricing_feature_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature_code" varchar NOT NULL,
  	"hidden" boolean DEFAULT false
  );
  
  CREATE TABLE "subneo_pricing_feature_overrides_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subneo_pricing_group_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"group_code" varchar NOT NULL,
  	"order" numeric
  );
  
  CREATE TABLE "subneo_pricing_group_overrides_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subneo_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum_subneo_pricing_source" DEFAULT 'fixture' NOT NULL,
  	"base_url" varchar DEFAULT 'https://api.subneo.io/v1',
  	"api_version" varchar DEFAULT '2026-09-03',
  	"cache_seconds" numeric DEFAULT 300,
  	"api_key" varchar,
  	"default_cta_url" varchar DEFAULT 'https://app.indicate-data.com/signup?plan={plan}&rate={rate}',
  	"contact_url" varchar DEFAULT '/contact',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "consent_categories_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"provider" varchar,
  	"integration" "enum_consent_categories_services_integration" DEFAULT 'none',
  	"cookies" varchar,
  	"privacy_url" varchar
  );
  
  CREATE TABLE "consent_categories_services_locales" (
  	"purpose" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "consent_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_consent_categories_key" NOT NULL
  );
  
  CREATE TABLE "consent_categories_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "consent" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"revision" numeric DEFAULT 1 NOT NULL,
  	"privacy_page_id" integer,
  	"imprint_page_id" integer,
  	"trigger_mode" "enum_consent_trigger_mode" DEFAULT 'link',
  	"trigger_position" "enum_consent_trigger_position" DEFAULT 'bottom-left',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "consent_locales" (
  	"banner_title" varchar,
  	"banner_text" varchar,
  	"settings_title" varchar,
  	"settings_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links" ADD CONSTRAINT "pages_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links_locales" ADD CONSTRAINT "pages_blocks_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_trust_logos" ADD CONSTRAINT "pages_blocks_hero_trust_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_trust_logos" ADD CONSTRAINT "pages_blocks_hero_trust_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall_logos" ADD CONSTRAINT "pages_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall_logos" ADD CONSTRAINT "pages_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall" ADD CONSTRAINT "pages_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall_locales" ADD CONSTRAINT "pages_blocks_logo_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_points" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_points_locales" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_links" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_links_locales" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_locales" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_locales" ADD CONSTRAINT "pages_blocks_feature_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story_points" ADD CONSTRAINT "pages_blocks_feature_story_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story_points_locales" ADD CONSTRAINT "pages_blocks_feature_story_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_story_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story_links" ADD CONSTRAINT "pages_blocks_feature_story_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story_links_locales" ADD CONSTRAINT "pages_blocks_feature_story_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_story_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story" ADD CONSTRAINT "pages_blocks_feature_story_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story" ADD CONSTRAINT "pages_blocks_feature_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_story_locales" ADD CONSTRAINT "pages_blocks_feature_story_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_prompts" ADD CONSTRAINT "pages_blocks_agent_showcase_prompts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_prompts_locales" ADD CONSTRAINT "pages_blocks_agent_showcase_prompts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase_prompts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_points" ADD CONSTRAINT "pages_blocks_agent_showcase_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_points_locales" ADD CONSTRAINT "pages_blocks_agent_showcase_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_channels" ADD CONSTRAINT "pages_blocks_agent_showcase_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_links" ADD CONSTRAINT "pages_blocks_agent_showcase_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_links_locales" ADD CONSTRAINT "pages_blocks_agent_showcase_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase" ADD CONSTRAINT "pages_blocks_agent_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agent_showcase_locales" ADD CONSTRAINT "pages_blocks_agent_showcase_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_steps" ADD CONSTRAINT "pages_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_steps_locales" ADD CONSTRAINT "pages_blocks_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_locales" ADD CONSTRAINT "pages_blocks_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_groups_items" ADD CONSTRAINT "pages_blocks_integrations_groups_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_groups_items" ADD CONSTRAINT "pages_blocks_integrations_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_groups" ADD CONSTRAINT "pages_blocks_integrations_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_groups_locales" ADD CONSTRAINT "pages_blocks_integrations_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_links" ADD CONSTRAINT "pages_blocks_integrations_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_links_locales" ADD CONSTRAINT "pages_blocks_integrations_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations" ADD CONSTRAINT "pages_blocks_integrations_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations" ADD CONSTRAINT "pages_blocks_integrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integrations_locales" ADD CONSTRAINT "pages_blocks_integrations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_directory" ADD CONSTRAINT "pages_blocks_integration_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_directory_locales" ADD CONSTRAINT "pages_blocks_integration_directory_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_directory"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_pillars" ADD CONSTRAINT "pages_blocks_pillars_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_pillars_locales" ADD CONSTRAINT "pages_blocks_pillars_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_tiles_links" ADD CONSTRAINT "pages_blocks_pillars_tiles_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_tiles_links_locales" ADD CONSTRAINT "pages_blocks_pillars_tiles_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars_tiles_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_tiles" ADD CONSTRAINT "pages_blocks_pillars_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_tiles_locales" ADD CONSTRAINT "pages_blocks_pillars_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars" ADD CONSTRAINT "pages_blocks_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pillars_locales" ADD CONSTRAINT "pages_blocks_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_points" ADD CONSTRAINT "pages_blocks_card_grid_cards_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_points_locales" ADD CONSTRAINT "pages_blocks_card_grid_cards_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_links" ADD CONSTRAINT "pages_blocks_card_grid_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_links_locales" ADD CONSTRAINT "pages_blocks_card_grid_cards_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_locales" ADD CONSTRAINT "pages_blocks_card_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid" ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_locales" ADD CONSTRAINT "pages_blocks_card_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items_locales" ADD CONSTRAINT "pages_blocks_stats_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_locales" ADD CONSTRAINT "pages_blocks_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items_locales" ADD CONSTRAINT "pages_blocks_testimonials_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_locales" ADD CONSTRAINT "pages_blocks_testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans_points" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans_points_locales" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_points_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_plans_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans_links" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans_links_locales" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_plans_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_plans_locales" ADD CONSTRAINT "pages_blocks_pricing_teaser_plans_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_links" ADD CONSTRAINT "pages_blocks_pricing_teaser_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_links_locales" ADD CONSTRAINT "pages_blocks_pricing_teaser_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser" ADD CONSTRAINT "pages_blocks_pricing_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_teaser_locales" ADD CONSTRAINT "pages_blocks_pricing_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_families" ADD CONSTRAINT "pages_blocks_pricing_families_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_locales" ADD CONSTRAINT "pages_blocks_pricing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items_locales" ADD CONSTRAINT "pages_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_locales" ADD CONSTRAINT "pages_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_section_links" ADD CONSTRAINT "pages_blocks_cta_section_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_section_links_locales" ADD CONSTRAINT "pages_blocks_cta_section_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_section_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_section" ADD CONSTRAINT "pages_blocks_cta_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_section_locales" ADD CONSTRAINT "pages_blocks_cta_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spotlight_links" ADD CONSTRAINT "pages_blocks_spotlight_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spotlight_links_locales" ADD CONSTRAINT "pages_blocks_spotlight_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_spotlight_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spotlight" ADD CONSTRAINT "pages_blocks_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spotlight_locales" ADD CONSTRAINT "pages_blocks_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_history" ADD CONSTRAINT "pages_blocks_document_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_history_locales" ADD CONSTRAINT "pages_blocks_document_history_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_document_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document" ADD CONSTRAINT "pages_blocks_document_sidebar_id_sidebars_id_fk" FOREIGN KEY ("sidebar_id") REFERENCES "public"."sidebars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_document" ADD CONSTRAINT "pages_blocks_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_locales" ADD CONSTRAINT "pages_blocks_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_links" ADD CONSTRAINT "_pages_v_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_links_locales" ADD CONSTRAINT "_pages_v_blocks_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_trust_logos" ADD CONSTRAINT "_pages_v_blocks_hero_trust_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_trust_logos" ADD CONSTRAINT "_pages_v_blocks_hero_trust_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall_logos" ADD CONSTRAINT "_pages_v_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall_logos" ADD CONSTRAINT "_pages_v_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD CONSTRAINT "_pages_v_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall_locales" ADD CONSTRAINT "_pages_v_blocks_logo_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_points" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_points_locales" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_points_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_links" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_links_locales" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_locales" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_locales" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story_points" ADD CONSTRAINT "_pages_v_blocks_feature_story_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story_points_locales" ADD CONSTRAINT "_pages_v_blocks_feature_story_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_story_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story_links" ADD CONSTRAINT "_pages_v_blocks_feature_story_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story_links_locales" ADD CONSTRAINT "_pages_v_blocks_feature_story_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_story_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story" ADD CONSTRAINT "_pages_v_blocks_feature_story_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story" ADD CONSTRAINT "_pages_v_blocks_feature_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_story_locales" ADD CONSTRAINT "_pages_v_blocks_feature_story_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_prompts" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_prompts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_prompts_locales" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_prompts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase_prompts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_points" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_points_locales" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_channels" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_links" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_links_locales" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_agent_showcase_locales" ADD CONSTRAINT "_pages_v_blocks_agent_showcase_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_agent_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_steps" ADD CONSTRAINT "_pages_v_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_steps_locales" ADD CONSTRAINT "_pages_v_blocks_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_locales" ADD CONSTRAINT "_pages_v_blocks_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_groups_items" ADD CONSTRAINT "_pages_v_blocks_integrations_groups_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_groups_items" ADD CONSTRAINT "_pages_v_blocks_integrations_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_groups" ADD CONSTRAINT "_pages_v_blocks_integrations_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_groups_locales" ADD CONSTRAINT "_pages_v_blocks_integrations_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_links" ADD CONSTRAINT "_pages_v_blocks_integrations_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_links_locales" ADD CONSTRAINT "_pages_v_blocks_integrations_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations" ADD CONSTRAINT "_pages_v_blocks_integrations_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations" ADD CONSTRAINT "_pages_v_blocks_integrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integrations_locales" ADD CONSTRAINT "_pages_v_blocks_integrations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_directory" ADD CONSTRAINT "_pages_v_blocks_integration_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_directory_locales" ADD CONSTRAINT "_pages_v_blocks_integration_directory_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integration_directory"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_pillars" ADD CONSTRAINT "_pages_v_blocks_pillars_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_pillars_locales" ADD CONSTRAINT "_pages_v_blocks_pillars_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_tiles_links" ADD CONSTRAINT "_pages_v_blocks_pillars_tiles_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_tiles_links_locales" ADD CONSTRAINT "_pages_v_blocks_pillars_tiles_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars_tiles_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_tiles" ADD CONSTRAINT "_pages_v_blocks_pillars_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_tiles_locales" ADD CONSTRAINT "_pages_v_blocks_pillars_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars" ADD CONSTRAINT "_pages_v_blocks_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pillars_locales" ADD CONSTRAINT "_pages_v_blocks_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_points" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_points_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_links" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_links_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD CONSTRAINT "_pages_v_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items_locales" ADD CONSTRAINT "_pages_v_blocks_stats_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_locales" ADD CONSTRAINT "_pages_v_blocks_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items_locales" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_locales" ADD CONSTRAINT "_pages_v_blocks_testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans_points" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans_points_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_points_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_plans_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans_links" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans_links_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_links_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_plans_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_plans_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_plans_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_links" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_links_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_teaser_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_families" ADD CONSTRAINT "_pages_v_blocks_pricing_families_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_locales" ADD CONSTRAINT "_pages_v_blocks_pricing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items_locales" ADD CONSTRAINT "_pages_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_locales" ADD CONSTRAINT "_pages_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_section_links" ADD CONSTRAINT "_pages_v_blocks_cta_section_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_section_links_locales" ADD CONSTRAINT "_pages_v_blocks_cta_section_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_section_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_section" ADD CONSTRAINT "_pages_v_blocks_cta_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_section_locales" ADD CONSTRAINT "_pages_v_blocks_cta_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spotlight_links" ADD CONSTRAINT "_pages_v_blocks_spotlight_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spotlight_links_locales" ADD CONSTRAINT "_pages_v_blocks_spotlight_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_spotlight_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spotlight" ADD CONSTRAINT "_pages_v_blocks_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spotlight_locales" ADD CONSTRAINT "_pages_v_blocks_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_history" ADD CONSTRAINT "_pages_v_blocks_document_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_history_locales" ADD CONSTRAINT "_pages_v_blocks_document_history_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_document_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document" ADD CONSTRAINT "_pages_v_blocks_document_sidebar_id_sidebars_id_fk" FOREIGN KEY ("sidebar_id") REFERENCES "public"."sidebars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document" ADD CONSTRAINT "_pages_v_blocks_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_locales" ADD CONSTRAINT "_pages_v_blocks_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sidebars_groups_links" ADD CONSTRAINT "sidebars_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebars_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_groups_links_locales" ADD CONSTRAINT "sidebars_groups_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebars_groups_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_groups" ADD CONSTRAINT "sidebars_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_groups_locales" ADD CONSTRAINT "sidebars_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebars_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_locales" ADD CONSTRAINT "sidebars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_rels" ADD CONSTRAINT "sidebars_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sidebars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_rels" ADD CONSTRAINT "sidebars_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebars_rels" ADD CONSTRAINT "sidebars_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sidebars_fk" FOREIGN KEY ("sidebars_id") REFERENCES "public"."sidebars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consent_logs_fk" FOREIGN KEY ("consent_logs_id") REFERENCES "public"."consent_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_columns_links" ADD CONSTRAINT "header_items_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_columns_links_locales" ADD CONSTRAINT "header_items_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_columns" ADD CONSTRAINT "header_items_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_columns_locales" ADD CONSTRAINT "header_items_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items" ADD CONSTRAINT "header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_locales" ADD CONSTRAINT "header_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links_locales" ADD CONSTRAINT "footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_families_highlight_features" ADD CONSTRAINT "subneo_pricing_families_highlight_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_families" ADD CONSTRAINT "subneo_pricing_families_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_families_locales" ADD CONSTRAINT "subneo_pricing_families_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_plan_overrides" ADD CONSTRAINT "subneo_pricing_plan_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_plan_overrides_locales" ADD CONSTRAINT "subneo_pricing_plan_overrides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_plan_overrides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_feature_overrides" ADD CONSTRAINT "subneo_pricing_feature_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_feature_overrides_locales" ADD CONSTRAINT "subneo_pricing_feature_overrides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_feature_overrides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_group_overrides" ADD CONSTRAINT "subneo_pricing_group_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_group_overrides_locales" ADD CONSTRAINT "subneo_pricing_group_overrides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_group_overrides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent_categories_services" ADD CONSTRAINT "consent_categories_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent_categories_services_locales" ADD CONSTRAINT "consent_categories_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent_categories_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent_categories" ADD CONSTRAINT "consent_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent_categories_locales" ADD CONSTRAINT "consent_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent" ADD CONSTRAINT "consent_privacy_page_id_pages_id_fk" FOREIGN KEY ("privacy_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consent" ADD CONSTRAINT "consent_imprint_page_id_pages_id_fk" FOREIGN KEY ("imprint_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consent_locales" ADD CONSTRAINT "consent_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_links_order_idx" ON "pages_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_links_parent_id_idx" ON "pages_blocks_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_links_locales_locale_parent_id_unique" ON "pages_blocks_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_trust_logos_order_idx" ON "pages_blocks_hero_trust_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_trust_logos_parent_id_idx" ON "pages_blocks_hero_trust_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_trust_logos_image_idx" ON "pages_blocks_hero_trust_logos" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_visual_visual_image_idx" ON "pages_blocks_hero" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_logos_order_idx" ON "pages_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_wall_logos_parent_id_idx" ON "pages_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_logos_image_idx" ON "pages_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "pages_blocks_logo_wall_order_idx" ON "pages_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_wall_parent_id_idx" ON "pages_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_path_idx" ON "pages_blocks_logo_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_logo_wall_locales_locale_parent_id_unique" ON "pages_blocks_logo_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_points_order_idx" ON "pages_blocks_feature_tabs_tabs_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_points_parent_id_idx" ON "pages_blocks_feature_tabs_tabs_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_tabs_tabs_points_locales_locale_parent_" ON "pages_blocks_feature_tabs_tabs_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_links_order_idx" ON "pages_blocks_feature_tabs_tabs_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_links_parent_id_idx" ON "pages_blocks_feature_tabs_tabs_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_tabs_tabs_links_locales_locale_parent_i" ON "pages_blocks_feature_tabs_tabs_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_order_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_parent_id_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_visual_visual_image_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_tabs_tabs_locales_locale_parent_id_uniq" ON "pages_blocks_feature_tabs_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_order_idx" ON "pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_parent_id_idx" ON "pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_path_idx" ON "pages_blocks_feature_tabs" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_feature_tabs_locales_locale_parent_id_unique" ON "pages_blocks_feature_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_story_points_order_idx" ON "pages_blocks_feature_story_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_story_points_parent_id_idx" ON "pages_blocks_feature_story_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_story_points_locales_locale_parent_id_u" ON "pages_blocks_feature_story_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_story_links_order_idx" ON "pages_blocks_feature_story_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_story_links_parent_id_idx" ON "pages_blocks_feature_story_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_story_links_locales_locale_parent_id_un" ON "pages_blocks_feature_story_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_story_order_idx" ON "pages_blocks_feature_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_story_parent_id_idx" ON "pages_blocks_feature_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_story_path_idx" ON "pages_blocks_feature_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_story_visual_visual_image_idx" ON "pages_blocks_feature_story" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_story_locales_locale_parent_id_unique" ON "pages_blocks_feature_story_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_prompts_order_idx" ON "pages_blocks_agent_showcase_prompts" USING btree ("_order");
  CREATE INDEX "pages_blocks_agent_showcase_prompts_parent_id_idx" ON "pages_blocks_agent_showcase_prompts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_agent_showcase_prompts_locales_locale_parent_id" ON "pages_blocks_agent_showcase_prompts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_points_order_idx" ON "pages_blocks_agent_showcase_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_agent_showcase_points_parent_id_idx" ON "pages_blocks_agent_showcase_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_agent_showcase_points_locales_locale_parent_id_" ON "pages_blocks_agent_showcase_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_channels_order_idx" ON "pages_blocks_agent_showcase_channels" USING btree ("_order");
  CREATE INDEX "pages_blocks_agent_showcase_channels_parent_id_idx" ON "pages_blocks_agent_showcase_channels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_links_order_idx" ON "pages_blocks_agent_showcase_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_agent_showcase_links_parent_id_idx" ON "pages_blocks_agent_showcase_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_agent_showcase_links_locales_locale_parent_id_u" ON "pages_blocks_agent_showcase_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_order_idx" ON "pages_blocks_agent_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_agent_showcase_parent_id_idx" ON "pages_blocks_agent_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_agent_showcase_path_idx" ON "pages_blocks_agent_showcase" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_agent_showcase_locales_locale_parent_id_unique" ON "pages_blocks_agent_showcase_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_steps_steps_order_idx" ON "pages_blocks_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_steps_parent_id_idx" ON "pages_blocks_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_steps_steps_locales_locale_parent_id_unique" ON "pages_blocks_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_steps_locales_locale_parent_id_unique" ON "pages_blocks_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integrations_groups_items_order_idx" ON "pages_blocks_integrations_groups_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_integrations_groups_items_parent_id_idx" ON "pages_blocks_integrations_groups_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integrations_groups_items_logo_idx" ON "pages_blocks_integrations_groups_items" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_integrations_groups_order_idx" ON "pages_blocks_integrations_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_integrations_groups_parent_id_idx" ON "pages_blocks_integrations_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integrations_groups_locales_locale_parent_id_un" ON "pages_blocks_integrations_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integrations_links_order_idx" ON "pages_blocks_integrations_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_integrations_links_parent_id_idx" ON "pages_blocks_integrations_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integrations_links_locales_locale_parent_id_uni" ON "pages_blocks_integrations_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integrations_order_idx" ON "pages_blocks_integrations" USING btree ("_order");
  CREATE INDEX "pages_blocks_integrations_parent_id_idx" ON "pages_blocks_integrations" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integrations_path_idx" ON "pages_blocks_integrations" USING btree ("_path");
  CREATE INDEX "pages_blocks_integrations_visual_visual_image_idx" ON "pages_blocks_integrations" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "pages_blocks_integrations_locales_locale_parent_id_unique" ON "pages_blocks_integrations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_directory_order_idx" ON "pages_blocks_integration_directory" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_directory_parent_id_idx" ON "pages_blocks_integration_directory" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integration_directory_path_idx" ON "pages_blocks_integration_directory" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_integration_directory_locales_locale_parent_id_" ON "pages_blocks_integration_directory_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pillars_pillars_order_idx" ON "pages_blocks_pillars_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_pillars_pillars_parent_id_idx" ON "pages_blocks_pillars_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pillars_pillars_locales_locale_parent_id_unique" ON "pages_blocks_pillars_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pillars_tiles_links_order_idx" ON "pages_blocks_pillars_tiles_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_pillars_tiles_links_parent_id_idx" ON "pages_blocks_pillars_tiles_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pillars_tiles_links_locales_locale_parent_id_un" ON "pages_blocks_pillars_tiles_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pillars_tiles_order_idx" ON "pages_blocks_pillars_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_pillars_tiles_parent_id_idx" ON "pages_blocks_pillars_tiles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pillars_tiles_locales_locale_parent_id_unique" ON "pages_blocks_pillars_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pillars_order_idx" ON "pages_blocks_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_pillars_parent_id_idx" ON "pages_blocks_pillars" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pillars_path_idx" ON "pages_blocks_pillars" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_pillars_locales_locale_parent_id_unique" ON "pages_blocks_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_points_order_idx" ON "pages_blocks_card_grid_cards_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_points_parent_id_idx" ON "pages_blocks_card_grid_cards_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_cards_points_locales_locale_parent_id" ON "pages_blocks_card_grid_cards_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_links_order_idx" ON "pages_blocks_card_grid_cards_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_links_parent_id_idx" ON "pages_blocks_card_grid_cards_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_cards_links_locales_locale_parent_id_" ON "pages_blocks_card_grid_cards_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_order_idx" ON "pages_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_parent_id_idx" ON "pages_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_cards_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_order_idx" ON "pages_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_parent_id_idx" ON "pages_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_path_idx" ON "pages_blocks_card_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_stats_items_locales_locale_parent_id_unique" ON "pages_blocks_stats_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_stats_locales_locale_parent_id_unique" ON "pages_blocks_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_avatar_idx" ON "pages_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "pages_blocks_testimonials_items_logo_idx" ON "pages_blocks_testimonials_items" USING btree ("logo_id");
  CREATE UNIQUE INDEX "pages_blocks_testimonials_items_locales_locale_parent_id_uni" ON "pages_blocks_testimonials_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_testimonials_locales_locale_parent_id_unique" ON "pages_blocks_testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_points_order_idx" ON "pages_blocks_pricing_teaser_plans_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_points_parent_id_idx" ON "pages_blocks_pricing_teaser_plans_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pricing_teaser_plans_points_locales_locale_pare" ON "pages_blocks_pricing_teaser_plans_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_links_order_idx" ON "pages_blocks_pricing_teaser_plans_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_links_parent_id_idx" ON "pages_blocks_pricing_teaser_plans_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pricing_teaser_plans_links_locales_locale_paren" ON "pages_blocks_pricing_teaser_plans_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_order_idx" ON "pages_blocks_pricing_teaser_plans" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_teaser_plans_parent_id_idx" ON "pages_blocks_pricing_teaser_plans" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pricing_teaser_plans_locales_locale_parent_id_u" ON "pages_blocks_pricing_teaser_plans_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_links_order_idx" ON "pages_blocks_pricing_teaser_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_teaser_links_parent_id_idx" ON "pages_blocks_pricing_teaser_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_pricing_teaser_links_locales_locale_parent_id_u" ON "pages_blocks_pricing_teaser_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_order_idx" ON "pages_blocks_pricing_teaser" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_teaser_parent_id_idx" ON "pages_blocks_pricing_teaser" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_teaser_path_idx" ON "pages_blocks_pricing_teaser" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_pricing_teaser_locales_locale_parent_id_unique" ON "pages_blocks_pricing_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_pricing_families_order_idx" ON "pages_blocks_pricing_families" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_families_parent_id_idx" ON "pages_blocks_pricing_families" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_pricing_locales_locale_parent_id_unique" ON "pages_blocks_pricing_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_faq_items_locales_locale_parent_id_unique" ON "pages_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_faq_locales_locale_parent_id_unique" ON "pages_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_section_links_order_idx" ON "pages_blocks_cta_section_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_section_links_parent_id_idx" ON "pages_blocks_cta_section_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_cta_section_links_locales_locale_parent_id_uniq" ON "pages_blocks_cta_section_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_section_order_idx" ON "pages_blocks_cta_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_section_parent_id_idx" ON "pages_blocks_cta_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_section_path_idx" ON "pages_blocks_cta_section" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cta_section_locales_locale_parent_id_unique" ON "pages_blocks_cta_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_spotlight_links_order_idx" ON "pages_blocks_spotlight_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_spotlight_links_parent_id_idx" ON "pages_blocks_spotlight_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_spotlight_links_locales_locale_parent_id_unique" ON "pages_blocks_spotlight_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_spotlight_order_idx" ON "pages_blocks_spotlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_spotlight_parent_id_idx" ON "pages_blocks_spotlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spotlight_path_idx" ON "pages_blocks_spotlight" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_spotlight_locales_locale_parent_id_unique" ON "pages_blocks_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_document_history_order_idx" ON "pages_blocks_document_history" USING btree ("_order");
  CREATE INDEX "pages_blocks_document_history_parent_id_idx" ON "pages_blocks_document_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_document_history_locales_locale_parent_id_uniqu" ON "pages_blocks_document_history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_document_order_idx" ON "pages_blocks_document" USING btree ("_order");
  CREATE INDEX "pages_blocks_document_parent_id_idx" ON "pages_blocks_document" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_document_path_idx" ON "pages_blocks_document" USING btree ("_path");
  CREATE INDEX "pages_blocks_document_sidebar_idx" ON "pages_blocks_document" USING btree ("sidebar_id");
  CREATE UNIQUE INDEX "pages_blocks_document_locales_locale_parent_id_unique" ON "pages_blocks_document_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages_locales" USING btree ("seo_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_links_order_idx" ON "_pages_v_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_links_parent_id_idx" ON "_pages_v_blocks_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_links_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_trust_logos_order_idx" ON "_pages_v_blocks_hero_trust_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_trust_logos_parent_id_idx" ON "_pages_v_blocks_hero_trust_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_trust_logos_image_idx" ON "_pages_v_blocks_hero_trust_logos" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_visual_visual_image_idx" ON "_pages_v_blocks_hero" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_order_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_parent_id_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_image_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_order_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_wall_parent_id_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_path_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_logo_wall_locales_locale_parent_id_unique" ON "_pages_v_blocks_logo_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_points_order_idx" ON "_pages_v_blocks_feature_tabs_tabs_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_points_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_tabs_tabs_points_locales_locale_pare" ON "_pages_v_blocks_feature_tabs_tabs_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_links_order_idx" ON "_pages_v_blocks_feature_tabs_tabs_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_links_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_tabs_tabs_links_locales_locale_paren" ON "_pages_v_blocks_feature_tabs_tabs_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_visual_visual_image_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_tabs_tabs_locales_locale_parent_id_u" ON "_pages_v_blocks_feature_tabs_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_order_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_path_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_tabs_locales_locale_parent_id_unique" ON "_pages_v_blocks_feature_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_story_points_order_idx" ON "_pages_v_blocks_feature_story_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_story_points_parent_id_idx" ON "_pages_v_blocks_feature_story_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_story_points_locales_locale_parent_i" ON "_pages_v_blocks_feature_story_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_story_links_order_idx" ON "_pages_v_blocks_feature_story_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_story_links_parent_id_idx" ON "_pages_v_blocks_feature_story_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_story_links_locales_locale_parent_id" ON "_pages_v_blocks_feature_story_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_story_order_idx" ON "_pages_v_blocks_feature_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_story_parent_id_idx" ON "_pages_v_blocks_feature_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_story_path_idx" ON "_pages_v_blocks_feature_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_story_visual_visual_image_idx" ON "_pages_v_blocks_feature_story" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_feature_story_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_feature_story_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_prompts_order_idx" ON "_pages_v_blocks_agent_showcase_prompts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_agent_showcase_prompts_parent_id_idx" ON "_pages_v_blocks_agent_showcase_prompts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_agent_showcase_prompts_locales_locale_parent" ON "_pages_v_blocks_agent_showcase_prompts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_points_order_idx" ON "_pages_v_blocks_agent_showcase_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_agent_showcase_points_parent_id_idx" ON "_pages_v_blocks_agent_showcase_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_agent_showcase_points_locales_locale_parent_" ON "_pages_v_blocks_agent_showcase_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_channels_order_idx" ON "_pages_v_blocks_agent_showcase_channels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_agent_showcase_channels_parent_id_idx" ON "_pages_v_blocks_agent_showcase_channels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_links_order_idx" ON "_pages_v_blocks_agent_showcase_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_agent_showcase_links_parent_id_idx" ON "_pages_v_blocks_agent_showcase_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_agent_showcase_links_locales_locale_parent_i" ON "_pages_v_blocks_agent_showcase_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_order_idx" ON "_pages_v_blocks_agent_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_agent_showcase_parent_id_idx" ON "_pages_v_blocks_agent_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_agent_showcase_path_idx" ON "_pages_v_blocks_agent_showcase" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_agent_showcase_locales_locale_parent_id_uniq" ON "_pages_v_blocks_agent_showcase_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_steps_order_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_steps_parent_id_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_steps_steps_locales_locale_parent_id_unique" ON "_pages_v_blocks_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_steps_locales_locale_parent_id_unique" ON "_pages_v_blocks_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_integrations_groups_items_order_idx" ON "_pages_v_blocks_integrations_groups_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integrations_groups_items_parent_id_idx" ON "_pages_v_blocks_integrations_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_integrations_groups_items_logo_idx" ON "_pages_v_blocks_integrations_groups_items" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_integrations_groups_order_idx" ON "_pages_v_blocks_integrations_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integrations_groups_parent_id_idx" ON "_pages_v_blocks_integrations_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_integrations_groups_locales_locale_parent_id" ON "_pages_v_blocks_integrations_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_integrations_links_order_idx" ON "_pages_v_blocks_integrations_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integrations_links_parent_id_idx" ON "_pages_v_blocks_integrations_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_integrations_links_locales_locale_parent_id_" ON "_pages_v_blocks_integrations_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_integrations_order_idx" ON "_pages_v_blocks_integrations" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integrations_parent_id_idx" ON "_pages_v_blocks_integrations" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_integrations_path_idx" ON "_pages_v_blocks_integrations" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_integrations_visual_visual_image_idx" ON "_pages_v_blocks_integrations" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_integrations_locales_locale_parent_id_unique" ON "_pages_v_blocks_integrations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_integration_directory_order_idx" ON "_pages_v_blocks_integration_directory" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integration_directory_parent_id_idx" ON "_pages_v_blocks_integration_directory" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_integration_directory_path_idx" ON "_pages_v_blocks_integration_directory" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_integration_directory_locales_locale_parent_" ON "_pages_v_blocks_integration_directory_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pillars_pillars_order_idx" ON "_pages_v_blocks_pillars_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pillars_pillars_parent_id_idx" ON "_pages_v_blocks_pillars_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pillars_pillars_locales_locale_parent_id_uni" ON "_pages_v_blocks_pillars_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pillars_tiles_links_order_idx" ON "_pages_v_blocks_pillars_tiles_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pillars_tiles_links_parent_id_idx" ON "_pages_v_blocks_pillars_tiles_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pillars_tiles_links_locales_locale_parent_id" ON "_pages_v_blocks_pillars_tiles_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pillars_tiles_order_idx" ON "_pages_v_blocks_pillars_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pillars_tiles_parent_id_idx" ON "_pages_v_blocks_pillars_tiles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pillars_tiles_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_pillars_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pillars_order_idx" ON "_pages_v_blocks_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pillars_parent_id_idx" ON "_pages_v_blocks_pillars" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pillars_path_idx" ON "_pages_v_blocks_pillars" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_pillars_locales_locale_parent_id_unique" ON "_pages_v_blocks_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_points_order_idx" ON "_pages_v_blocks_card_grid_cards_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_points_parent_id_idx" ON "_pages_v_blocks_card_grid_cards_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_cards_points_locales_locale_parent" ON "_pages_v_blocks_card_grid_cards_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_links_order_idx" ON "_pages_v_blocks_card_grid_cards_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_links_parent_id_idx" ON "_pages_v_blocks_card_grid_cards_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_cards_links_locales_locale_parent_" ON "_pages_v_blocks_card_grid_cards_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_order_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_parent_id_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_cards_locales_locale_parent_id_uni" ON "_pages_v_blocks_card_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_order_idx" ON "_pages_v_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_parent_id_idx" ON "_pages_v_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_path_idx" ON "_pages_v_blocks_card_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_locales_locale_parent_id_unique" ON "_pages_v_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_stats_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_stats_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_stats_locales_locale_parent_id_unique" ON "_pages_v_blocks_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_avatar_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_logo_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("logo_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_testimonials_items_locales_locale_parent_id_" ON "_pages_v_blocks_testimonials_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_testimonials_locales_locale_parent_id_unique" ON "_pages_v_blocks_testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_points_order_idx" ON "_pages_v_blocks_pricing_teaser_plans_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_points_parent_id_idx" ON "_pages_v_blocks_pricing_teaser_plans_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_teaser_plans_points_locales_locale_p" ON "_pages_v_blocks_pricing_teaser_plans_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_links_order_idx" ON "_pages_v_blocks_pricing_teaser_plans_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_links_parent_id_idx" ON "_pages_v_blocks_pricing_teaser_plans_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_teaser_plans_links_locales_locale_pa" ON "_pages_v_blocks_pricing_teaser_plans_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_order_idx" ON "_pages_v_blocks_pricing_teaser_plans" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_plans_parent_id_idx" ON "_pages_v_blocks_pricing_teaser_plans" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_teaser_plans_locales_locale_parent_i" ON "_pages_v_blocks_pricing_teaser_plans_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_links_order_idx" ON "_pages_v_blocks_pricing_teaser_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_links_parent_id_idx" ON "_pages_v_blocks_pricing_teaser_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_teaser_links_locales_locale_parent_i" ON "_pages_v_blocks_pricing_teaser_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_order_idx" ON "_pages_v_blocks_pricing_teaser" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_parent_id_idx" ON "_pages_v_blocks_pricing_teaser" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_teaser_path_idx" ON "_pages_v_blocks_pricing_teaser" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_teaser_locales_locale_parent_id_uniq" ON "_pages_v_blocks_pricing_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_families_order_idx" ON "_pages_v_blocks_pricing_families" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_families_parent_id_idx" ON "_pages_v_blocks_pricing_families" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_pricing_locales_locale_parent_id_unique" ON "_pages_v_blocks_pricing_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_section_links_order_idx" ON "_pages_v_blocks_cta_section_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_section_links_parent_id_idx" ON "_pages_v_blocks_cta_section_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_section_links_locales_locale_parent_id_u" ON "_pages_v_blocks_cta_section_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_section_order_idx" ON "_pages_v_blocks_cta_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_section_parent_id_idx" ON "_pages_v_blocks_cta_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_section_path_idx" ON "_pages_v_blocks_cta_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_section_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_spotlight_links_order_idx" ON "_pages_v_blocks_spotlight_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spotlight_links_parent_id_idx" ON "_pages_v_blocks_spotlight_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_spotlight_links_locales_locale_parent_id_uni" ON "_pages_v_blocks_spotlight_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_spotlight_order_idx" ON "_pages_v_blocks_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spotlight_parent_id_idx" ON "_pages_v_blocks_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spotlight_path_idx" ON "_pages_v_blocks_spotlight" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_spotlight_locales_locale_parent_id_unique" ON "_pages_v_blocks_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_document_history_order_idx" ON "_pages_v_blocks_document_history" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_document_history_parent_id_idx" ON "_pages_v_blocks_document_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_document_history_locales_locale_parent_id_un" ON "_pages_v_blocks_document_history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_document_order_idx" ON "_pages_v_blocks_document" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_document_parent_id_idx" ON "_pages_v_blocks_document" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_document_path_idx" ON "_pages_v_blocks_document" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_document_sidebar_idx" ON "_pages_v_blocks_document" USING btree ("sidebar_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_document_locales_locale_parent_id_unique" ON "_pages_v_blocks_document_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v_locales" USING btree ("version_seo_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "sidebars_groups_links_order_idx" ON "sidebars_groups_links" USING btree ("_order");
  CREATE INDEX "sidebars_groups_links_parent_id_idx" ON "sidebars_groups_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sidebars_groups_links_locales_locale_parent_id_unique" ON "sidebars_groups_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sidebars_groups_order_idx" ON "sidebars_groups" USING btree ("_order");
  CREATE INDEX "sidebars_groups_parent_id_idx" ON "sidebars_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sidebars_groups_locales_locale_parent_id_unique" ON "sidebars_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sidebars_updated_at_idx" ON "sidebars" USING btree ("updated_at");
  CREATE INDEX "sidebars_created_at_idx" ON "sidebars" USING btree ("created_at");
  CREATE UNIQUE INDEX "sidebars_locales_locale_parent_id_unique" ON "sidebars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sidebars_rels_order_idx" ON "sidebars_rels" USING btree ("order");
  CREATE INDEX "sidebars_rels_parent_idx" ON "sidebars_rels" USING btree ("parent_id");
  CREATE INDEX "sidebars_rels_path_idx" ON "sidebars_rels" USING btree ("path");
  CREATE INDEX "sidebars_rels_pages_id_idx" ON "sidebars_rels" USING btree ("pages_id");
  CREATE INDEX "sidebars_rels_posts_id_idx" ON "sidebars_rels" USING btree ("posts_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "consent_logs_consent_id_idx" ON "consent_logs" USING btree ("consent_id");
  CREATE INDEX "consent_logs_updated_at_idx" ON "consent_logs" USING btree ("updated_at");
  CREATE INDEX "consent_logs_created_at_idx" ON "consent_logs" USING btree ("created_at");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_sidebars_id_idx" ON "payload_locked_documents_rels" USING btree ("sidebars_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_consent_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("consent_logs_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_items_columns_links_order_idx" ON "header_items_columns_links" USING btree ("_order");
  CREATE INDEX "header_items_columns_links_parent_id_idx" ON "header_items_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_items_columns_links_locales_locale_parent_id_unique" ON "header_items_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_items_columns_order_idx" ON "header_items_columns" USING btree ("_order");
  CREATE INDEX "header_items_columns_parent_id_idx" ON "header_items_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_items_columns_locales_locale_parent_id_unique" ON "header_items_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_items_order_idx" ON "header_items" USING btree ("_order");
  CREATE INDEX "header_items_parent_id_idx" ON "header_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_items_locales_locale_parent_id_unique" ON "header_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_links_locales_locale_parent_id_unique" ON "footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "subneo_pricing_families_highlight_features_order_idx" ON "subneo_pricing_families_highlight_features" USING btree ("_order");
  CREATE INDEX "subneo_pricing_families_highlight_features_parent_id_idx" ON "subneo_pricing_families_highlight_features" USING btree ("_parent_id");
  CREATE INDEX "subneo_pricing_families_order_idx" ON "subneo_pricing_families" USING btree ("_order");
  CREATE INDEX "subneo_pricing_families_parent_id_idx" ON "subneo_pricing_families" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subneo_pricing_families_locales_locale_parent_id_unique" ON "subneo_pricing_families_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subneo_pricing_plan_overrides_order_idx" ON "subneo_pricing_plan_overrides" USING btree ("_order");
  CREATE INDEX "subneo_pricing_plan_overrides_parent_id_idx" ON "subneo_pricing_plan_overrides" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subneo_pricing_plan_overrides_locales_locale_parent_id_uniqu" ON "subneo_pricing_plan_overrides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subneo_pricing_feature_overrides_order_idx" ON "subneo_pricing_feature_overrides" USING btree ("_order");
  CREATE INDEX "subneo_pricing_feature_overrides_parent_id_idx" ON "subneo_pricing_feature_overrides" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subneo_pricing_feature_overrides_locales_locale_parent_id_un" ON "subneo_pricing_feature_overrides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subneo_pricing_group_overrides_order_idx" ON "subneo_pricing_group_overrides" USING btree ("_order");
  CREATE INDEX "subneo_pricing_group_overrides_parent_id_idx" ON "subneo_pricing_group_overrides" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subneo_pricing_group_overrides_locales_locale_parent_id_uniq" ON "subneo_pricing_group_overrides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "consent_categories_services_order_idx" ON "consent_categories_services" USING btree ("_order");
  CREATE INDEX "consent_categories_services_parent_id_idx" ON "consent_categories_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "consent_categories_services_locales_locale_parent_id_unique" ON "consent_categories_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "consent_categories_order_idx" ON "consent_categories" USING btree ("_order");
  CREATE INDEX "consent_categories_parent_id_idx" ON "consent_categories" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "consent_categories_locales_locale_parent_id_unique" ON "consent_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "consent_privacy_page_idx" ON "consent" USING btree ("privacy_page_id");
  CREATE INDEX "consent_imprint_page_idx" ON "consent" USING btree ("imprint_page_id");
  CREATE UNIQUE INDEX "consent_locales_locale_parent_id_unique" ON "consent_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero_links_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_trust_logos" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "pages_blocks_logo_wall" CASCADE;
  DROP TABLE "pages_blocks_logo_wall_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_points" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_points_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_links" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_links_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_story_points" CASCADE;
  DROP TABLE "pages_blocks_feature_story_points_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_story_links" CASCADE;
  DROP TABLE "pages_blocks_feature_story_links_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_story" CASCADE;
  DROP TABLE "pages_blocks_feature_story_locales" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_prompts" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_prompts_locales" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_points" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_points_locales" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_channels" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_links" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_links_locales" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase" CASCADE;
  DROP TABLE "pages_blocks_agent_showcase_locales" CASCADE;
  DROP TABLE "pages_blocks_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_steps_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_integrations_groups_items" CASCADE;
  DROP TABLE "pages_blocks_integrations_groups" CASCADE;
  DROP TABLE "pages_blocks_integrations_groups_locales" CASCADE;
  DROP TABLE "pages_blocks_integrations_links" CASCADE;
  DROP TABLE "pages_blocks_integrations_links_locales" CASCADE;
  DROP TABLE "pages_blocks_integrations" CASCADE;
  DROP TABLE "pages_blocks_integrations_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_directory" CASCADE;
  DROP TABLE "pages_blocks_integration_directory_locales" CASCADE;
  DROP TABLE "pages_blocks_pillars_pillars" CASCADE;
  DROP TABLE "pages_blocks_pillars_pillars_locales" CASCADE;
  DROP TABLE "pages_blocks_pillars_tiles_links" CASCADE;
  DROP TABLE "pages_blocks_pillars_tiles_links_locales" CASCADE;
  DROP TABLE "pages_blocks_pillars_tiles" CASCADE;
  DROP TABLE "pages_blocks_pillars_tiles_locales" CASCADE;
  DROP TABLE "pages_blocks_pillars" CASCADE;
  DROP TABLE "pages_blocks_pillars_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_points" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_points_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_links" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_links_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid" CASCADE;
  DROP TABLE "pages_blocks_card_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats_items_locales" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_stats_locales" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items_locales" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_testimonials_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans_points" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans_points_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans_links" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans_links_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_plans_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_links" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_links_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser" CASCADE;
  DROP TABLE "pages_blocks_pricing_teaser_locales" CASCADE;
  DROP TABLE "pages_blocks_pricing_families" CASCADE;
  DROP TABLE "pages_blocks_pricing" CASCADE;
  DROP TABLE "pages_blocks_pricing_locales" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq_items_locales" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_faq_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_section_links" CASCADE;
  DROP TABLE "pages_blocks_cta_section_links_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_section" CASCADE;
  DROP TABLE "pages_blocks_cta_section_locales" CASCADE;
  DROP TABLE "pages_blocks_spotlight_links" CASCADE;
  DROP TABLE "pages_blocks_spotlight_links_locales" CASCADE;
  DROP TABLE "pages_blocks_spotlight" CASCADE;
  DROP TABLE "pages_blocks_spotlight_locales" CASCADE;
  DROP TABLE "pages_blocks_document_history" CASCADE;
  DROP TABLE "pages_blocks_document_history_locales" CASCADE;
  DROP TABLE "pages_blocks_document" CASCADE;
  DROP TABLE "pages_blocks_document_locales" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_trust_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_points" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_links" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story_points" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story_links" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_story_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_prompts" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_prompts_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_points" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_channels" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_links" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_agent_showcase_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_groups_items" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_groups_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_links" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations" CASCADE;
  DROP TABLE "_pages_v_blocks_integrations_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_directory" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_directory_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_pillars" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_pillars_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_tiles_links" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_tiles_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_tiles_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars" CASCADE;
  DROP TABLE "_pages_v_blocks_pillars_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_points" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_links" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans_points" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans_links" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_plans_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_links" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_teaser_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_families" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_section_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_section_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_section" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_section_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_spotlight_links" CASCADE;
  DROP TABLE "_pages_v_blocks_spotlight_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_spotlight_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_document_history" CASCADE;
  DROP TABLE "_pages_v_blocks_document_history_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_document" CASCADE;
  DROP TABLE "_pages_v_blocks_document_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "sidebars_groups_links" CASCADE;
  DROP TABLE "sidebars_groups_links_locales" CASCADE;
  DROP TABLE "sidebars_groups" CASCADE;
  DROP TABLE "sidebars_groups_locales" CASCADE;
  DROP TABLE "sidebars" CASCADE;
  DROP TABLE "sidebars_locales" CASCADE;
  DROP TABLE "sidebars_rels" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "consent_logs" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "header_items_columns_links" CASCADE;
  DROP TABLE "header_items_columns_links_locales" CASCADE;
  DROP TABLE "header_items_columns" CASCADE;
  DROP TABLE "header_items_columns_locales" CASCADE;
  DROP TABLE "header_items" CASCADE;
  DROP TABLE "header_items_locales" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_legal_links_locales" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "subneo_pricing_families_highlight_features" CASCADE;
  DROP TABLE "subneo_pricing_families" CASCADE;
  DROP TABLE "subneo_pricing_families_locales" CASCADE;
  DROP TABLE "subneo_pricing_plan_overrides" CASCADE;
  DROP TABLE "subneo_pricing_plan_overrides_locales" CASCADE;
  DROP TABLE "subneo_pricing_feature_overrides" CASCADE;
  DROP TABLE "subneo_pricing_feature_overrides_locales" CASCADE;
  DROP TABLE "subneo_pricing_group_overrides" CASCADE;
  DROP TABLE "subneo_pricing_group_overrides_locales" CASCADE;
  DROP TABLE "subneo_pricing" CASCADE;
  DROP TABLE "consent_categories_services" CASCADE;
  DROP TABLE "consent_categories_services_locales" CASCADE;
  DROP TABLE "consent_categories" CASCADE;
  DROP TABLE "consent_categories_locales" CASCADE;
  DROP TABLE "consent" CASCADE;
  DROP TABLE "consent_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_header_align";
  DROP TYPE "public"."enum_pages_blocks_hero_visual_type";
  DROP TYPE "public"."enum_pages_blocks_hero_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_background";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_header_align";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_display";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_settings_background";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_points_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_header_align";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_settings_background";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_feature_story_points_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_story_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_feature_story_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_feature_story_header_align";
  DROP TYPE "public"."enum_pages_blocks_feature_story_layout";
  DROP TYPE "public"."enum_pages_blocks_feature_story_visual_type";
  DROP TYPE "public"."enum_pages_blocks_feature_story_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_feature_story_settings_background";
  DROP TYPE "public"."enum_pages_blocks_feature_story_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_prompts_chart";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_points_icon";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_header_align";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_settings_background";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_steps_steps_icon";
  DROP TYPE "public"."enum_pages_blocks_steps_header_align";
  DROP TYPE "public"."enum_pages_blocks_steps_settings_background";
  DROP TYPE "public"."enum_pages_blocks_steps_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_integrations_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_integrations_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_integrations_header_align";
  DROP TYPE "public"."enum_pages_blocks_integrations_visual_type";
  DROP TYPE "public"."enum_pages_blocks_integrations_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_integrations_settings_background";
  DROP TYPE "public"."enum_pages_blocks_integrations_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_header_align";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_request_link_type";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_settings_background";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_pillars_pillars_icon";
  DROP TYPE "public"."enum_pages_blocks_pillars_tiles_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_pillars_tiles_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_pillars_header_align";
  DROP TYPE "public"."enum_pages_blocks_pillars_settings_background";
  DROP TYPE "public"."enum_pages_blocks_pillars_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_icon";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_size";
  DROP TYPE "public"."enum_pages_blocks_card_grid_header_align";
  DROP TYPE "public"."enum_pages_blocks_card_grid_layout";
  DROP TYPE "public"."enum_pages_blocks_card_grid_settings_background";
  DROP TYPE "public"."enum_pages_blocks_card_grid_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_stats_header_align";
  DROP TYPE "public"."enum_pages_blocks_stats_settings_background";
  DROP TYPE "public"."enum_pages_blocks_stats_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_testimonials_header_align";
  DROP TYPE "public"."enum_pages_blocks_testimonials_settings_background";
  DROP TYPE "public"."enum_pages_blocks_testimonials_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_plans_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_plans_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_header_align";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_settings_background";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_pricing_header_align";
  DROP TYPE "public"."enum_pages_blocks_pricing_settings_background";
  DROP TYPE "public"."enum_pages_blocks_pricing_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_faq_header_align";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_background";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_cta_section_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_section_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_section_header_align";
  DROP TYPE "public"."enum_pages_blocks_cta_section_settings_background";
  DROP TYPE "public"."enum_pages_blocks_cta_section_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_spotlight_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_spotlight_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_spotlight_layout";
  DROP TYPE "public"."enum_pages_blocks_spotlight_settings_background";
  DROP TYPE "public"."enum_pages_blocks_spotlight_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_document_header_align";
  DROP TYPE "public"."enum_pages_blocks_document_binding_language";
  DROP TYPE "public"."enum_pages_blocks_document_settings_background";
  DROP TYPE "public"."enum_pages_blocks_document_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_hero_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_hero_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_display";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_layout";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_prompts_chart";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_steps_steps_icon";
  DROP TYPE "public"."enum__pages_v_blocks_steps_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_steps_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_steps_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_request_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_pillars_icon";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_tiles_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_tiles_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_size";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_layout";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_stats_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_stats_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_stats_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_plans_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_plans_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_faq_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_layout";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_document_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_document_binding_language";
  DROP TYPE "public"."enum__pages_v_blocks_document_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_document_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_sidebars_groups_links_link_type";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_site_settings_social_platform";
  DROP TYPE "public"."enum_header_items_columns_links_link_type";
  DROP TYPE "public"."enum_header_items_columns_links_icon";
  DROP TYPE "public"."enum_header_items_type";
  DROP TYPE "public"."enum_header_items_link_type";
  DROP TYPE "public"."enum_header_items_featured_link_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_header_announcement_link_type";
  DROP TYPE "public"."enum_header_secondary_cta_link_type";
  DROP TYPE "public"."enum_header_primary_cta_link_type";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_legal_links_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_subneo_pricing_families_role";
  DROP TYPE "public"."enum_subneo_pricing_source";
  DROP TYPE "public"."enum_consent_categories_services_integration";
  DROP TYPE "public"."enum_consent_categories_key";
  DROP TYPE "public"."enum_consent_trigger_mode";
  DROP TYPE "public"."enum_consent_trigger_position";`)
}
