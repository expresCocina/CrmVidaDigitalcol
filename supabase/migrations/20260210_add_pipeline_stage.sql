-- Migration: Add pipeline stage to leads table
-- Created: 2026-02-10

-- Add pipeline_stage column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'nuevo';

-- Add constraint for valid values
ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_pipeline_stage_check;

ALTER TABLE leads
ADD CONSTRAINT leads_pipeline_stage_check 
CHECK (pipeline_stage IN ('nuevo', 'contactado', 'cotizado', 'negociacion', 'ganado', 'perdido'));

-- Update existing leads to default stage
UPDATE leads 
SET pipeline_stage = 'nuevo' 
WHERE pipeline_stage IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage 
ON leads(pipeline_stage);

-- Add comment
COMMENT ON COLUMN leads.pipeline_stage IS 'Etapa del lead en el pipeline de ventas: nuevo, contactado, cotizado, negociacion, ganado, perdido';
