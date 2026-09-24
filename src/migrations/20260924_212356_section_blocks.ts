import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { convertSectionBlocks } from '../sections/convertPages'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_heading_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_heading_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_heading_header_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_heading_size" AS ENUM('h2', 'display');
  CREATE TYPE "public"."enum_pages_blocks_heading_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_heading_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_heading_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_heading_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_media_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_media_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_media_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_media_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_media_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_media_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_media_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_items_items_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_items_items_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum_pages_blocks_items_items_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_items_items_size" AS ENUM('sm', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_items_style" AS ENUM('points', 'cards', 'steps', 'stats');
  CREATE TYPE "public"."enum_pages_blocks_items_columns" AS ENUM('auto', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_items_frame" AS ENUM('none', 'panel');
  CREATE TYPE "public"."enum_pages_blocks_items_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_items_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_items_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_items_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_actions_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_actions_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_actions_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_actions_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_actions_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_actions_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_actions_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_integration_tree_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_integration_tree_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integration_tree_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integration_tree_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_split_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum_pages_blocks_split_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_split_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_split_media_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_split_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_split_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_split_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_split_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_split_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_split_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_feature_story_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_steps_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_steps_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integrations_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integrations_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pillars_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pillars_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_stats_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_stats_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pricing_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_pricing_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_cta_section_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_spotlight_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_document_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_document_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_header_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_size" AS ENUM('h2', 'display');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_media_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_media_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_media_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum__pages_v_blocks_media_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_media_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_media_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_media_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_items_items_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_items_items_links_link_appearance" AS ENUM('link');
  CREATE TYPE "public"."enum__pages_v_blocks_items_items_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_items_items_size" AS ENUM('sm', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_items_style" AS ENUM('points', 'cards', 'steps', 'stats');
  CREATE TYPE "public"."enum__pages_v_blocks_items_columns" AS ENUM('auto', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_items_frame" AS ENUM('none', 'panel');
  CREATE TYPE "public"."enum__pages_v_blocks_items_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_items_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_items_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_items_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_tree_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_tree_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_tree_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_tree_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_split_points_icon" AS ENUM('chart', 'sparkles', 'message', 'plug', 'database', 'layers', 'users', 'shield', 'lock', 'clock', 'calendar', 'target', 'trending', 'bell', 'globe', 'building', 'buildings', 'briefcase', 'code', 'check', 'euro', 'percent', 'bed', 'upload', 'palette', 'eye', 'zap', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_split_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_split_links_link_appearance" AS ENUM('default', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_split_media_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_split_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_split_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_split_settings_background" AS ENUM('default', 'tinted', 'dark', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_split_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_split_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_split_settings_spacing" AS ENUM('default', 'compact', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_spotlight_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_document_settings_gap_top" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_document_settings_gap_bottom" AS ENUM('auto', 'none', 'tight', 'normal', 'large');
  ALTER TYPE "public"."enum_pages_blocks_hero_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_logo_wall_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_feature_tabs_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_feature_story_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_agent_showcase_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_steps_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_integrations_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_integration_directory_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_pillars_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_card_grid_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_stats_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_testimonials_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_pricing_teaser_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_pricing_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_faq_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_cta_section_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum_pages_blocks_document_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_logo_wall_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_story_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_steps_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_integrations_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_integration_directory_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_pillars_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_card_grid_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_stats_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_testimonials_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_pricing_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_faq_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_cta_section_header_align" ADD VALUE 'right';
  ALTER TYPE "public"."enum__pages_v_blocks_document_header_align" ADD VALUE 'right';
  CREATE TABLE "pages_blocks_heading_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_heading_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_heading_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_heading_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"header_align" "enum_pages_blocks_heading_header_align" DEFAULT 'left',
  	"size" "enum_pages_blocks_heading_size" DEFAULT 'h2',
  	"settings_background" "enum_pages_blocks_heading_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_heading_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_heading_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_heading_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_heading_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"visual_type" "enum_pages_blocks_media_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_media_visual_illustration" DEFAULT 'dashboard',
  	"visual_image_id" integer,
  	"width" "enum_pages_blocks_media_width" DEFAULT 'full',
  	"settings_background" "enum_pages_blocks_media_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_media_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_media_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_media_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_items_items_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_items_items_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_items_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_items_items_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_items_items_links_link_appearance" DEFAULT 'link'
  );
  
  CREATE TABLE "pages_blocks_items_items_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_items_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_items_items_icon",
  	"value" varchar,
  	"suffix" varchar,
  	"size" "enum_pages_blocks_items_items_size" DEFAULT 'sm'
  );
  
  CREATE TABLE "pages_blocks_items_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"style" "enum_pages_blocks_items_style" DEFAULT 'points',
  	"columns" "enum_pages_blocks_items_columns" DEFAULT 'auto',
  	"frame" "enum_pages_blocks_items_frame" DEFAULT 'none',
  	"divider" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_items_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_items_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_items_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_items_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_actions_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_actions_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_actions_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_actions_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"align" "enum_pages_blocks_actions_align" DEFAULT 'left',
  	"settings_background" "enum_pages_blocks_actions_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_actions_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_actions_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_actions_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_integration_tree_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_integration_tree_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_tree_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_tree" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_integration_tree_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_integration_tree_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_integration_tree_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_integration_tree_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_split_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_split_points_icon"
  );
  
  CREATE TABLE "pages_blocks_split_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_split_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_split_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_split_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_split_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"media_side" "enum_pages_blocks_split_media_side" DEFAULT 'right',
  	"visual_type" "enum_pages_blocks_split_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum_pages_blocks_split_visual_illustration" DEFAULT 'builder',
  	"visual_image_id" integer,
  	"settings_background" "enum_pages_blocks_split_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum_pages_blocks_split_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum_pages_blocks_split_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum_pages_blocks_split_settings_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_split_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_heading_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_heading_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_heading_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"header_align" "enum__pages_v_blocks_heading_header_align" DEFAULT 'left',
  	"size" "enum__pages_v_blocks_heading_size" DEFAULT 'h2',
  	"settings_background" "enum__pages_v_blocks_heading_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_heading_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_heading_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_heading_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"visual_type" "enum__pages_v_blocks_media_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_media_visual_illustration" DEFAULT 'dashboard',
  	"visual_image_id" integer,
  	"width" "enum__pages_v_blocks_media_width" DEFAULT 'full',
  	"settings_background" "enum__pages_v_blocks_media_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_media_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_media_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_media_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_items_items_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_items_items_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_items_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_items_items_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_items_items_links_link_appearance" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_items_items_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_items_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_items_items_icon",
  	"value" varchar,
  	"suffix" varchar,
  	"size" "enum__pages_v_blocks_items_items_size" DEFAULT 'sm',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_items_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"style" "enum__pages_v_blocks_items_style" DEFAULT 'points',
  	"columns" "enum__pages_v_blocks_items_columns" DEFAULT 'auto',
  	"frame" "enum__pages_v_blocks_items_frame" DEFAULT 'none',
  	"divider" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_items_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_items_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_items_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_items_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_actions_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_actions_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_actions_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_actions_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"align" "enum__pages_v_blocks_actions_align" DEFAULT 'left',
  	"settings_background" "enum__pages_v_blocks_actions_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_actions_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_actions_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_actions_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integration_tree_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integration_tree_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_integration_tree_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_integration_tree" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_integration_tree_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_integration_tree_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_integration_tree_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_integration_tree_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_split_points_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_points_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_split_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_split_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_split_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"media_side" "enum__pages_v_blocks_split_media_side" DEFAULT 'right',
  	"visual_type" "enum__pages_v_blocks_split_visual_type" DEFAULT 'illustration',
  	"visual_illustration" "enum__pages_v_blocks_split_visual_illustration" DEFAULT 'builder',
  	"visual_image_id" integer,
  	"settings_background" "enum__pages_v_blocks_split_settings_background" DEFAULT 'default',
  	"settings_gap_top" "enum__pages_v_blocks_split_settings_gap_top" DEFAULT 'auto',
  	"settings_gap_bottom" "enum__pages_v_blocks_split_settings_gap_bottom" DEFAULT 'auto',
  	"settings_anchor" varchar,
  	"settings_spacing" "enum__pages_v_blocks_split_settings_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_locales" (
  	"header_eyebrow" varchar,
  	"header_heading" varchar,
  	"header_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "settings_spacing" SET DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "settings_spacing" SET DEFAULT 'default';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "settings_gap_top" "enum_pages_blocks_hero_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_hero_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_logo_wall" ADD COLUMN "settings_gap_top" "enum_pages_blocks_logo_wall_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_logo_wall" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_logo_wall_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_feature_tabs" ADD COLUMN "settings_gap_top" "enum_pages_blocks_feature_tabs_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_feature_tabs" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_feature_tabs_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_feature_story" ADD COLUMN "settings_gap_top" "enum_pages_blocks_feature_story_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_feature_story" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_feature_story_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_agent_showcase" ADD COLUMN "settings_gap_top" "enum_pages_blocks_agent_showcase_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_agent_showcase" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_agent_showcase_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_steps" ADD COLUMN "settings_gap_top" "enum_pages_blocks_steps_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_steps" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_steps_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_integrations" ADD COLUMN "settings_gap_top" "enum_pages_blocks_integrations_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_integrations" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_integrations_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_integration_directory" ADD COLUMN "settings_gap_top" "enum_pages_blocks_integration_directory_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_integration_directory" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_integration_directory_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pillars" ADD COLUMN "settings_gap_top" "enum_pages_blocks_pillars_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pillars" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_pillars_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_card_grid" ADD COLUMN "settings_gap_top" "enum_pages_blocks_card_grid_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_card_grid" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_card_grid_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_stats" ADD COLUMN "settings_gap_top" "enum_pages_blocks_stats_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_stats" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_stats_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "settings_gap_top" "enum_pages_blocks_testimonials_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_testimonials_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pricing_teaser" ADD COLUMN "settings_gap_top" "enum_pages_blocks_pricing_teaser_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pricing_teaser" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_pricing_teaser_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "settings_gap_top" "enum_pages_blocks_pricing_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_pricing_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "settings_gap_top" "enum_pages_blocks_faq_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_faq_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_cta_section" ADD COLUMN "settings_gap_top" "enum_pages_blocks_cta_section_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_cta_section" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_cta_section_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_spotlight" ADD COLUMN "settings_gap_top" "enum_pages_blocks_spotlight_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_spotlight" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_spotlight_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_document" ADD COLUMN "settings_gap_top" "enum_pages_blocks_document_settings_gap_top" DEFAULT 'none';
  ALTER TABLE "pages_blocks_document" ADD COLUMN "settings_gap_bottom" "enum_pages_blocks_document_settings_gap_bottom" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_hero_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_hero_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_logo_wall_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_logo_wall_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_feature_tabs_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_feature_tabs_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_feature_story" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_feature_story_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_feature_story" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_feature_story_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_agent_showcase" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_agent_showcase_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_agent_showcase" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_agent_showcase_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_steps_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_steps_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_integrations" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_integrations_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_integrations" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_integrations_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_integration_directory" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_integration_directory_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_integration_directory" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_integration_directory_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pillars" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_pillars_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pillars" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_pillars_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_card_grid_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_card_grid_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_stats_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_stats_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_testimonials_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_testimonials_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_pricing_teaser_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_pricing_teaser_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_pricing_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_pricing_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_faq_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_faq_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_cta_section" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_cta_section_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_cta_section" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_cta_section_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_spotlight" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_spotlight_settings_gap_top" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_spotlight" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_spotlight_settings_gap_bottom" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_document" ADD COLUMN "settings_gap_top" "enum__pages_v_blocks_document_settings_gap_top" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_document" ADD COLUMN "settings_gap_bottom" "enum__pages_v_blocks_document_settings_gap_bottom" DEFAULT 'none';
  ALTER TABLE "pages_blocks_heading_links" ADD CONSTRAINT "pages_blocks_heading_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_heading"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading_links_locales" ADD CONSTRAINT "pages_blocks_heading_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_heading_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading_locales" ADD CONSTRAINT "pages_blocks_heading_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_heading"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items_points" ADD CONSTRAINT "pages_blocks_items_items_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items_points_locales" ADD CONSTRAINT "pages_blocks_items_items_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items_items_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items_links" ADD CONSTRAINT "pages_blocks_items_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items_links_locales" ADD CONSTRAINT "pages_blocks_items_items_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items_items_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items" ADD CONSTRAINT "pages_blocks_items_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items_items_locales" ADD CONSTRAINT "pages_blocks_items_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_items" ADD CONSTRAINT "pages_blocks_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_actions_links" ADD CONSTRAINT "pages_blocks_actions_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_actions_links_locales" ADD CONSTRAINT "pages_blocks_actions_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_actions_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_actions" ADD CONSTRAINT "pages_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_tree_groups_items" ADD CONSTRAINT "pages_blocks_integration_tree_groups_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_tree_groups_items" ADD CONSTRAINT "pages_blocks_integration_tree_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_tree_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_tree_groups" ADD CONSTRAINT "pages_blocks_integration_tree_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_tree"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_tree_groups_locales" ADD CONSTRAINT "pages_blocks_integration_tree_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_tree_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_tree" ADD CONSTRAINT "pages_blocks_integration_tree_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_points" ADD CONSTRAINT "pages_blocks_split_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_points_locales" ADD CONSTRAINT "pages_blocks_split_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_links" ADD CONSTRAINT "pages_blocks_split_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_links_locales" ADD CONSTRAINT "pages_blocks_split_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split" ADD CONSTRAINT "pages_blocks_split_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_split" ADD CONSTRAINT "pages_blocks_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_locales" ADD CONSTRAINT "pages_blocks_split_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading_links" ADD CONSTRAINT "_pages_v_blocks_heading_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_heading"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading_links_locales" ADD CONSTRAINT "_pages_v_blocks_heading_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_heading_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading_locales" ADD CONSTRAINT "_pages_v_blocks_heading_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_heading"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items_points" ADD CONSTRAINT "_pages_v_blocks_items_items_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items_points_locales" ADD CONSTRAINT "_pages_v_blocks_items_items_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items_items_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items_links" ADD CONSTRAINT "_pages_v_blocks_items_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items_links_locales" ADD CONSTRAINT "_pages_v_blocks_items_items_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items_items_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items" ADD CONSTRAINT "_pages_v_blocks_items_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items_items_locales" ADD CONSTRAINT "_pages_v_blocks_items_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_items_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_items" ADD CONSTRAINT "_pages_v_blocks_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_actions_links" ADD CONSTRAINT "_pages_v_blocks_actions_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_actions_links_locales" ADD CONSTRAINT "_pages_v_blocks_actions_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_actions_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_actions" ADD CONSTRAINT "_pages_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups_items" ADD CONSTRAINT "_pages_v_blocks_integration_tree_groups_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups_items" ADD CONSTRAINT "_pages_v_blocks_integration_tree_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integration_tree_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups" ADD CONSTRAINT "_pages_v_blocks_integration_tree_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integration_tree"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups_locales" ADD CONSTRAINT "_pages_v_blocks_integration_tree_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_integration_tree_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_integration_tree" ADD CONSTRAINT "_pages_v_blocks_integration_tree_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_points" ADD CONSTRAINT "_pages_v_blocks_split_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_points_locales" ADD CONSTRAINT "_pages_v_blocks_split_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_links" ADD CONSTRAINT "_pages_v_blocks_split_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_links_locales" ADD CONSTRAINT "_pages_v_blocks_split_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split" ADD CONSTRAINT "_pages_v_blocks_split_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split" ADD CONSTRAINT "_pages_v_blocks_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_locales" ADD CONSTRAINT "_pages_v_blocks_split_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_heading_links_order_idx" ON "pages_blocks_heading_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_links_parent_id_idx" ON "pages_blocks_heading_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_heading_links_locales_locale_parent_id_unique" ON "pages_blocks_heading_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_heading_locales_locale_parent_id_unique" ON "pages_blocks_heading_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_media_order_idx" ON "pages_blocks_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_parent_id_idx" ON "pages_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_path_idx" ON "pages_blocks_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_visual_visual_image_idx" ON "pages_blocks_media" USING btree ("visual_image_id");
  CREATE INDEX "pages_blocks_items_items_points_order_idx" ON "pages_blocks_items_items_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_items_items_points_parent_id_idx" ON "pages_blocks_items_items_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_items_items_points_locales_locale_parent_id_uni" ON "pages_blocks_items_items_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_items_items_links_order_idx" ON "pages_blocks_items_items_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_items_items_links_parent_id_idx" ON "pages_blocks_items_items_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_items_items_links_locales_locale_parent_id_uniq" ON "pages_blocks_items_items_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_items_items_order_idx" ON "pages_blocks_items_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_items_items_parent_id_idx" ON "pages_blocks_items_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_items_items_locales_locale_parent_id_unique" ON "pages_blocks_items_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_items_order_idx" ON "pages_blocks_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_items_parent_id_idx" ON "pages_blocks_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_items_path_idx" ON "pages_blocks_items" USING btree ("_path");
  CREATE INDEX "pages_blocks_actions_links_order_idx" ON "pages_blocks_actions_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_actions_links_parent_id_idx" ON "pages_blocks_actions_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_actions_links_locales_locale_parent_id_unique" ON "pages_blocks_actions_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_actions_order_idx" ON "pages_blocks_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_actions_parent_id_idx" ON "pages_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_actions_path_idx" ON "pages_blocks_actions" USING btree ("_path");
  CREATE INDEX "pages_blocks_integration_tree_groups_items_order_idx" ON "pages_blocks_integration_tree_groups_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_tree_groups_items_parent_id_idx" ON "pages_blocks_integration_tree_groups_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integration_tree_groups_items_logo_idx" ON "pages_blocks_integration_tree_groups_items" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_integration_tree_groups_order_idx" ON "pages_blocks_integration_tree_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_tree_groups_parent_id_idx" ON "pages_blocks_integration_tree_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integration_tree_groups_locales_locale_parent_i" ON "pages_blocks_integration_tree_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_tree_order_idx" ON "pages_blocks_integration_tree" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_tree_parent_id_idx" ON "pages_blocks_integration_tree" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integration_tree_path_idx" ON "pages_blocks_integration_tree" USING btree ("_path");
  CREATE INDEX "pages_blocks_split_points_order_idx" ON "pages_blocks_split_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_points_parent_id_idx" ON "pages_blocks_split_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_split_points_locales_locale_parent_id_unique" ON "pages_blocks_split_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_split_links_order_idx" ON "pages_blocks_split_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_links_parent_id_idx" ON "pages_blocks_split_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_split_links_locales_locale_parent_id_unique" ON "pages_blocks_split_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_split_order_idx" ON "pages_blocks_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_parent_id_idx" ON "pages_blocks_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_path_idx" ON "pages_blocks_split" USING btree ("_path");
  CREATE INDEX "pages_blocks_split_visual_visual_image_idx" ON "pages_blocks_split" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "pages_blocks_split_locales_locale_parent_id_unique" ON "pages_blocks_split_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_links_order_idx" ON "_pages_v_blocks_heading_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_links_parent_id_idx" ON "_pages_v_blocks_heading_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_heading_links_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_heading_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_heading_locales_locale_parent_id_unique" ON "_pages_v_blocks_heading_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_media_order_idx" ON "_pages_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_parent_id_idx" ON "_pages_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_path_idx" ON "_pages_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_visual_visual_image_idx" ON "_pages_v_blocks_media" USING btree ("visual_image_id");
  CREATE INDEX "_pages_v_blocks_items_items_points_order_idx" ON "_pages_v_blocks_items_items_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_items_items_points_parent_id_idx" ON "_pages_v_blocks_items_items_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_items_items_points_locales_locale_parent_id_" ON "_pages_v_blocks_items_items_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_items_items_links_order_idx" ON "_pages_v_blocks_items_items_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_items_items_links_parent_id_idx" ON "_pages_v_blocks_items_items_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_items_items_links_locales_locale_parent_id_u" ON "_pages_v_blocks_items_items_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_items_items_order_idx" ON "_pages_v_blocks_items_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_items_items_parent_id_idx" ON "_pages_v_blocks_items_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_items_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_items_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_items_order_idx" ON "_pages_v_blocks_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_items_parent_id_idx" ON "_pages_v_blocks_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_items_path_idx" ON "_pages_v_blocks_items" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_actions_links_order_idx" ON "_pages_v_blocks_actions_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_actions_links_parent_id_idx" ON "_pages_v_blocks_actions_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_actions_links_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_actions_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_actions_order_idx" ON "_pages_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_actions_parent_id_idx" ON "_pages_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_actions_path_idx" ON "_pages_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_integration_tree_groups_items_order_idx" ON "_pages_v_blocks_integration_tree_groups_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integration_tree_groups_items_parent_id_idx" ON "_pages_v_blocks_integration_tree_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_integration_tree_groups_items_logo_idx" ON "_pages_v_blocks_integration_tree_groups_items" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_integration_tree_groups_order_idx" ON "_pages_v_blocks_integration_tree_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integration_tree_groups_parent_id_idx" ON "_pages_v_blocks_integration_tree_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_integration_tree_groups_locales_locale_paren" ON "_pages_v_blocks_integration_tree_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_integration_tree_order_idx" ON "_pages_v_blocks_integration_tree" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_integration_tree_parent_id_idx" ON "_pages_v_blocks_integration_tree" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_integration_tree_path_idx" ON "_pages_v_blocks_integration_tree" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_split_points_order_idx" ON "_pages_v_blocks_split_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_points_parent_id_idx" ON "_pages_v_blocks_split_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_split_points_locales_locale_parent_id_unique" ON "_pages_v_blocks_split_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_split_links_order_idx" ON "_pages_v_blocks_split_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_links_parent_id_idx" ON "_pages_v_blocks_split_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_split_links_locales_locale_parent_id_unique" ON "_pages_v_blocks_split_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_split_order_idx" ON "_pages_v_blocks_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_parent_id_idx" ON "_pages_v_blocks_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_path_idx" ON "_pages_v_blocks_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_split_visual_visual_image_idx" ON "_pages_v_blocks_split" USING btree ("visual_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_split_locales_locale_parent_id_unique" ON "_pages_v_blocks_split_locales" USING btree ("_locale","_parent_id");`)

  // Document's new gap columns default to 'none', so existing rows arrive with explicit gaps and
  // the data step's widget-spacing conversion would skip them. Carry the old spacing over first.
  await db.execute(sql`
  UPDATE "pages_blocks_document" SET
    "settings_gap_top" = (CASE "settings_spacing" WHEN 'compact' THEN 'tight' WHEN 'none' THEN 'none' ELSE 'auto' END)::"enum_pages_blocks_document_settings_gap_top",
    "settings_gap_bottom" = (CASE "settings_spacing" WHEN 'compact' THEN 'tight' WHEN 'none' THEN 'none' ELSE 'auto' END)::"enum_pages_blocks_document_settings_gap_bottom";
  UPDATE "_pages_v_blocks_document" SET
    "settings_gap_top" = (CASE "settings_spacing" WHEN 'compact' THEN 'tight' WHEN 'none' THEN 'none' ELSE 'auto' END)::"enum__pages_v_blocks_document_settings_gap_top",
    "settings_gap_bottom" = (CASE "settings_spacing" WHEN 'compact' THEN 'tight' WHEN 'none' THEN 'none' ELSE 'auto' END)::"enum__pages_v_blocks_document_settings_gap_bottom";`)

  // Convert the legacy structural blocks and old widget spacing into section blocks (idempotent,
  // published and draft states per locale, inside this migration's transaction). A database
  // without pages (a fresh install) skips it: the current config may already expect columns that
  // later migrations add.
  const pages = await db.execute(sql`SELECT 1 FROM "pages" LIMIT 1`)
  if (pages.rows.length === 0) {
    payload.logger.info('[sections] no pages to convert')
    return
  }
  const result = await convertSectionBlocks({ payload, req })
  payload.logger.info(`[sections] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
}

// Schema only. The converted content lives in the new tables, so a down loses it; roll back a
// deploy of this migration by restoring the pre-deploy database backup instead.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_heading_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_heading_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_heading_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_actions_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_actions_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_integration_tree_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_integration_tree_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_integration_tree_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_integration_tree" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_actions_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_actions_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_integration_tree_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_integration_tree" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_heading_links" CASCADE;
  DROP TABLE "pages_blocks_heading_links_locales" CASCADE;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_heading_locales" CASCADE;
  DROP TABLE "pages_blocks_media" CASCADE;
  DROP TABLE "pages_blocks_items_items_points" CASCADE;
  DROP TABLE "pages_blocks_items_items_points_locales" CASCADE;
  DROP TABLE "pages_blocks_items_items_links" CASCADE;
  DROP TABLE "pages_blocks_items_items_links_locales" CASCADE;
  DROP TABLE "pages_blocks_items_items" CASCADE;
  DROP TABLE "pages_blocks_items_items_locales" CASCADE;
  DROP TABLE "pages_blocks_items" CASCADE;
  DROP TABLE "pages_blocks_actions_links" CASCADE;
  DROP TABLE "pages_blocks_actions_links_locales" CASCADE;
  DROP TABLE "pages_blocks_actions" CASCADE;
  DROP TABLE "pages_blocks_integration_tree_groups_items" CASCADE;
  DROP TABLE "pages_blocks_integration_tree_groups" CASCADE;
  DROP TABLE "pages_blocks_integration_tree_groups_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_tree" CASCADE;
  DROP TABLE "pages_blocks_split_points" CASCADE;
  DROP TABLE "pages_blocks_split_points_locales" CASCADE;
  DROP TABLE "pages_blocks_split_links" CASCADE;
  DROP TABLE "pages_blocks_split_links_locales" CASCADE;
  DROP TABLE "pages_blocks_split" CASCADE;
  DROP TABLE "pages_blocks_split_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_heading_links" CASCADE;
  DROP TABLE "_pages_v_blocks_heading_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_heading_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_media" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items_points" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items_links" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items" CASCADE;
  DROP TABLE "_pages_v_blocks_items_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_items" CASCADE;
  DROP TABLE "_pages_v_blocks_actions_links" CASCADE;
  DROP TABLE "_pages_v_blocks_actions_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_tree_groups_items" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_tree_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_tree_groups_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_integration_tree" CASCADE;
  DROP TABLE "_pages_v_blocks_split_points" CASCADE;
  DROP TABLE "_pages_v_blocks_split_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_split_links" CASCADE;
  DROP TABLE "_pages_v_blocks_split_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_split" CASCADE;
  DROP TABLE "_pages_v_blocks_split_locales" CASCADE;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_header_align";
  CREATE TYPE "public"."enum_pages_blocks_hero_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_hero_header_align";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_hero_header_align" USING "header_align"::"public"."enum_pages_blocks_hero_header_align";
  ALTER TABLE "pages_blocks_logo_wall" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_logo_wall" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_logo_wall_header_align";
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_logo_wall" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_logo_wall_header_align";
  ALTER TABLE "pages_blocks_logo_wall" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_logo_wall_header_align" USING "header_align"::"public"."enum_pages_blocks_logo_wall_header_align";
  ALTER TABLE "pages_blocks_feature_tabs" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_tabs" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_header_align";
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_feature_tabs" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_feature_tabs_header_align";
  ALTER TABLE "pages_blocks_feature_tabs" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_feature_tabs_header_align" USING "header_align"::"public"."enum_pages_blocks_feature_tabs_header_align";
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_story_header_align";
  CREATE TYPE "public"."enum_pages_blocks_feature_story_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_feature_story_header_align";
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_feature_story_header_align" USING "header_align"::"public"."enum_pages_blocks_feature_story_header_align";
  ALTER TABLE "pages_blocks_agent_showcase" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_agent_showcase" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_header_align";
  CREATE TYPE "public"."enum_pages_blocks_agent_showcase_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_agent_showcase" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_agent_showcase_header_align";
  ALTER TABLE "pages_blocks_agent_showcase" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_agent_showcase_header_align" USING "header_align"::"public"."enum_pages_blocks_agent_showcase_header_align";
  ALTER TABLE "pages_blocks_steps" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_steps" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_steps_header_align";
  CREATE TYPE "public"."enum_pages_blocks_steps_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_steps" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_steps_header_align";
  ALTER TABLE "pages_blocks_steps" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_steps_header_align" USING "header_align"::"public"."enum_pages_blocks_steps_header_align";
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_integrations_header_align";
  CREATE TYPE "public"."enum_pages_blocks_integrations_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_integrations_header_align";
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_integrations_header_align" USING "header_align"::"public"."enum_pages_blocks_integrations_header_align";
  ALTER TABLE "pages_blocks_integration_directory" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_integration_directory" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_integration_directory_header_align";
  CREATE TYPE "public"."enum_pages_blocks_integration_directory_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_integration_directory" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_integration_directory_header_align";
  ALTER TABLE "pages_blocks_integration_directory" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_integration_directory_header_align" USING "header_align"::"public"."enum_pages_blocks_integration_directory_header_align";
  ALTER TABLE "pages_blocks_pillars" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_pillars" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_pillars_header_align";
  CREATE TYPE "public"."enum_pages_blocks_pillars_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_pillars" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_pillars_header_align";
  ALTER TABLE "pages_blocks_pillars" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_pillars_header_align" USING "header_align"::"public"."enum_pages_blocks_pillars_header_align";
  ALTER TABLE "pages_blocks_card_grid" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_card_grid" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_card_grid_header_align";
  CREATE TYPE "public"."enum_pages_blocks_card_grid_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_card_grid" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_card_grid_header_align";
  ALTER TABLE "pages_blocks_card_grid" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_card_grid_header_align" USING "header_align"::"public"."enum_pages_blocks_card_grid_header_align";
  ALTER TABLE "pages_blocks_stats" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_stats" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_stats_header_align";
  CREATE TYPE "public"."enum_pages_blocks_stats_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_stats" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_stats_header_align";
  ALTER TABLE "pages_blocks_stats" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_stats_header_align" USING "header_align"::"public"."enum_pages_blocks_stats_header_align";
  ALTER TABLE "pages_blocks_testimonials" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_testimonials" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_testimonials_header_align";
  CREATE TYPE "public"."enum_pages_blocks_testimonials_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_testimonials" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_testimonials_header_align";
  ALTER TABLE "pages_blocks_testimonials" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_testimonials_header_align" USING "header_align"::"public"."enum_pages_blocks_testimonials_header_align";
  ALTER TABLE "pages_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_header_align";
  CREATE TYPE "public"."enum_pages_blocks_pricing_teaser_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_pricing_teaser_header_align";
  ALTER TABLE "pages_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_pricing_teaser_header_align" USING "header_align"::"public"."enum_pages_blocks_pricing_teaser_header_align";
  ALTER TABLE "pages_blocks_pricing" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_pricing" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_pricing_header_align";
  CREATE TYPE "public"."enum_pages_blocks_pricing_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_pricing" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_pricing_header_align";
  ALTER TABLE "pages_blocks_pricing" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_pricing_header_align" USING "header_align"::"public"."enum_pages_blocks_pricing_header_align";
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_faq_header_align";
  CREATE TYPE "public"."enum_pages_blocks_faq_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_faq_header_align";
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_faq_header_align" USING "header_align"::"public"."enum_pages_blocks_faq_header_align";
  ALTER TABLE "pages_blocks_cta_section" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_cta_section" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_cta_section_header_align";
  CREATE TYPE "public"."enum_pages_blocks_cta_section_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_cta_section" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_cta_section_header_align";
  ALTER TABLE "pages_blocks_cta_section" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_cta_section_header_align" USING "header_align"::"public"."enum_pages_blocks_cta_section_header_align";
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_document_header_align";
  CREATE TYPE "public"."enum_pages_blocks_document_header_align" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum_pages_blocks_document_header_align";
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum_pages_blocks_document_header_align" USING "header_align"::"public"."enum_pages_blocks_document_header_align";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_hero_header_align";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_hero_header_align" USING "header_align"::"public"."enum__pages_v_blocks_hero_header_align";
  ALTER TABLE "_pages_v_blocks_logo_wall" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_logo_wall" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_logo_wall" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_logo_wall_header_align";
  ALTER TABLE "_pages_v_blocks_logo_wall" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_logo_wall_header_align" USING "header_align"::"public"."enum__pages_v_blocks_logo_wall_header_align";
  ALTER TABLE "_pages_v_blocks_feature_tabs" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_feature_tabs" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_feature_tabs_header_align";
  ALTER TABLE "_pages_v_blocks_feature_tabs" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_feature_tabs_header_align" USING "header_align"::"public"."enum__pages_v_blocks_feature_tabs_header_align";
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_feature_story_header_align";
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_feature_story_header_align" USING "header_align"::"public"."enum__pages_v_blocks_feature_story_header_align";
  ALTER TABLE "_pages_v_blocks_agent_showcase" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_agent_showcase" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_agent_showcase" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_agent_showcase_header_align";
  ALTER TABLE "_pages_v_blocks_agent_showcase" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_agent_showcase_header_align" USING "header_align"::"public"."enum__pages_v_blocks_agent_showcase_header_align";
  ALTER TABLE "_pages_v_blocks_steps" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_steps" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_steps_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_steps_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_steps" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_steps_header_align";
  ALTER TABLE "_pages_v_blocks_steps" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_steps_header_align" USING "header_align"::"public"."enum__pages_v_blocks_steps_header_align";
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_integrations_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_integrations_header_align";
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_integrations_header_align" USING "header_align"::"public"."enum__pages_v_blocks_integrations_header_align";
  ALTER TABLE "_pages_v_blocks_integration_directory" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_integration_directory" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_integration_directory_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_integration_directory" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_integration_directory_header_align";
  ALTER TABLE "_pages_v_blocks_integration_directory" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_integration_directory_header_align" USING "header_align"::"public"."enum__pages_v_blocks_integration_directory_header_align";
  ALTER TABLE "_pages_v_blocks_pillars" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_pillars" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_pillars_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_pillars_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_pillars" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_pillars_header_align";
  ALTER TABLE "_pages_v_blocks_pillars" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_pillars_header_align" USING "header_align"::"public"."enum__pages_v_blocks_pillars_header_align";
  ALTER TABLE "_pages_v_blocks_card_grid" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_card_grid" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_card_grid" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_card_grid_header_align";
  ALTER TABLE "_pages_v_blocks_card_grid" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_card_grid_header_align" USING "header_align"::"public"."enum__pages_v_blocks_card_grid_header_align";
  ALTER TABLE "_pages_v_blocks_stats" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_stats" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_stats_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_stats_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_stats" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_stats_header_align";
  ALTER TABLE "_pages_v_blocks_stats" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_stats_header_align" USING "header_align"::"public"."enum__pages_v_blocks_stats_header_align";
  ALTER TABLE "_pages_v_blocks_testimonials" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_testimonials" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_testimonials" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_testimonials_header_align";
  ALTER TABLE "_pages_v_blocks_testimonials" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_testimonials_header_align" USING "header_align"::"public"."enum__pages_v_blocks_testimonials_header_align";
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_pricing_teaser_header_align";
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_pricing_teaser_header_align" USING "header_align"::"public"."enum__pages_v_blocks_pricing_teaser_header_align";
  ALTER TABLE "_pages_v_blocks_pricing" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_pricing" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_pricing_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_pricing" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_pricing_header_align";
  ALTER TABLE "_pages_v_blocks_pricing" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_pricing_header_align" USING "header_align"::"public"."enum__pages_v_blocks_pricing_header_align";
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_faq_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_faq_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_faq_header_align";
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_faq_header_align" USING "header_align"::"public"."enum__pages_v_blocks_faq_header_align";
  ALTER TABLE "_pages_v_blocks_cta_section" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_cta_section" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_cta_section_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_cta_section" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_cta_section_header_align";
  ALTER TABLE "_pages_v_blocks_cta_section" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_cta_section_header_align" USING "header_align"::"public"."enum__pages_v_blocks_cta_section_header_align";
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "header_align" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "header_align" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_document_header_align";
  CREATE TYPE "public"."enum__pages_v_blocks_document_header_align" AS ENUM('left', 'center');
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "header_align" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_document_header_align";
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "header_align" SET DATA TYPE "public"."enum__pages_v_blocks_document_header_align" USING "header_align"::"public"."enum__pages_v_blocks_document_header_align";
  ALTER TABLE "pages_blocks_document" ALTER COLUMN "settings_spacing" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_document" ALTER COLUMN "settings_spacing" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_logo_wall" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_logo_wall" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_feature_tabs" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_feature_tabs" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_feature_story" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_feature_story" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_agent_showcase" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_agent_showcase" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_steps" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_steps" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_integrations" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_integrations" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_integration_directory" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_integration_directory" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_pillars" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_pillars" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_card_grid" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_card_grid" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_stats" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_stats" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_pricing_teaser" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_pricing_teaser" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_cta_section" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_cta_section" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_spotlight" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_spotlight" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "pages_blocks_document" DROP COLUMN "settings_gap_top";
  ALTER TABLE "pages_blocks_document" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_logo_wall" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_logo_wall" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_feature_tabs" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_feature_tabs" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_feature_story" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_feature_story" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_agent_showcase" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_agent_showcase" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_integrations" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_integrations" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_integration_directory" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_integration_directory" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_pillars" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_pillars" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_card_grid" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_card_grid" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_pricing_teaser" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_pricing_teaser" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_cta_section" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_cta_section" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_spotlight" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_spotlight" DROP COLUMN "settings_gap_bottom";
  ALTER TABLE "_pages_v_blocks_document" DROP COLUMN "settings_gap_top";
  ALTER TABLE "_pages_v_blocks_document" DROP COLUMN "settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_heading_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_heading_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_heading_header_align";
  DROP TYPE "public"."enum_pages_blocks_heading_size";
  DROP TYPE "public"."enum_pages_blocks_heading_settings_background";
  DROP TYPE "public"."enum_pages_blocks_heading_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_heading_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_heading_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_media_visual_type";
  DROP TYPE "public"."enum_pages_blocks_media_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_media_width";
  DROP TYPE "public"."enum_pages_blocks_media_settings_background";
  DROP TYPE "public"."enum_pages_blocks_media_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_media_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_media_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_items_items_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_items_items_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_items_items_icon";
  DROP TYPE "public"."enum_pages_blocks_items_items_size";
  DROP TYPE "public"."enum_pages_blocks_items_style";
  DROP TYPE "public"."enum_pages_blocks_items_columns";
  DROP TYPE "public"."enum_pages_blocks_items_frame";
  DROP TYPE "public"."enum_pages_blocks_items_settings_background";
  DROP TYPE "public"."enum_pages_blocks_items_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_items_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_items_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_actions_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_actions_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_actions_align";
  DROP TYPE "public"."enum_pages_blocks_actions_settings_background";
  DROP TYPE "public"."enum_pages_blocks_actions_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_actions_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_actions_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_integration_tree_settings_background";
  DROP TYPE "public"."enum_pages_blocks_integration_tree_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_integration_tree_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_integration_tree_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_split_points_icon";
  DROP TYPE "public"."enum_pages_blocks_split_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_split_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_split_media_side";
  DROP TYPE "public"."enum_pages_blocks_split_visual_type";
  DROP TYPE "public"."enum_pages_blocks_split_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_split_settings_background";
  DROP TYPE "public"."enum_pages_blocks_split_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_split_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_split_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_feature_story_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_feature_story_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_agent_showcase_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_steps_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_steps_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_integrations_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_integrations_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_integration_directory_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_pillars_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_pillars_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_card_grid_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_card_grid_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_stats_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_stats_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_testimonials_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_testimonials_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_pricing_teaser_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_pricing_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_pricing_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_cta_section_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_cta_section_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_spotlight_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_spotlight_settings_gap_bottom";
  DROP TYPE "public"."enum_pages_blocks_document_settings_gap_top";
  DROP TYPE "public"."enum_pages_blocks_document_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_heading_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_heading_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_heading_header_align";
  DROP TYPE "public"."enum__pages_v_blocks_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_heading_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_heading_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_heading_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_heading_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_media_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_media_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_media_width";
  DROP TYPE "public"."enum__pages_v_blocks_media_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_media_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_media_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_media_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_items_items_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_items_items_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_items_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_items_items_size";
  DROP TYPE "public"."enum__pages_v_blocks_items_style";
  DROP TYPE "public"."enum__pages_v_blocks_items_columns";
  DROP TYPE "public"."enum__pages_v_blocks_items_frame";
  DROP TYPE "public"."enum__pages_v_blocks_items_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_items_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_items_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_items_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_actions_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_actions_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_actions_align";
  DROP TYPE "public"."enum__pages_v_blocks_actions_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_actions_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_actions_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_actions_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_integration_tree_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_integration_tree_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_integration_tree_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_integration_tree_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_split_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_split_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_split_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_split_media_side";
  DROP TYPE "public"."enum__pages_v_blocks_split_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_split_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_split_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_split_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_split_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_split_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_agent_showcase_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_steps_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_steps_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_integrations_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_integration_directory_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_pillars_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_stats_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_stats_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_teaser_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_cta_section_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_spotlight_settings_gap_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_document_settings_gap_top";
  DROP TYPE "public"."enum__pages_v_blocks_document_settings_gap_bottom";`)
}
