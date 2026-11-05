CREATE TYPE "AlertIcon" AS ENUM (
  'general',
  'emergency',
  'snowplow',
  'weather',
  'road_closure',
  'traffic',
  'construction',
  'water',
  'power',
  'fire',
  'health',
  'school',
  'trash',
  'parks',
  'meeting',
  'event'
);

ALTER TABLE "Alert" ADD COLUMN "iconId" "AlertIcon";
