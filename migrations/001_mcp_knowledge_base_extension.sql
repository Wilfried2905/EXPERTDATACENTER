-- Migration: Extension MCP Knowledge Base
-- Ajoute les données standards TIA-942 officielles

-- Insertion des standards TIA-942 officiels de base
INSERT INTO mcp_knowledge_base (
    title, content, category, standard_family, standard_code, 
    section_reference, official_source_url, version, relationship_type, 
    verified_official, official_document_ref, tags
) VALUES
-- Standards TIA-942 principaux
('Infrastructure Site TIA-942', 
'Exigences d''infrastructure de site datacenter incluant alimentation, refroidissement, protection incendie et systèmes de sécurité physique selon TIA-942-A.', 
'INFRASTRUCTURE', 'TIA', 'TIA-942-A', 'Section 4.1 - Site Infrastructure', 
'https://tiaonline.org/standards/tia-942-a/', '2014', 'primary', true, 
'ANSI/TIA-942-A-2014', 'infrastructure,site,datacenter,tia942'),

('Systèmes Électriques TIA-942', 
'Exigences de distribution électrique incluant systèmes UPS, générateurs et spécifications qualité électrique pour installations datacenter.', 
'ÉLECTRIQUE', 'TIA', 'TIA-942-A', 'Section 4.2 - Electrical Systems', 
'https://tiaonline.org/standards/tia-942-a/', '2014', 'primary', true, 
'ANSI/TIA-942-A-2014', 'électrique,ups,générateur,alimentation'),

('Infrastructure Télécommunications TIA-942', 
'Systèmes de câblage structuré, chemins et espaces pour infrastructure télécommunications datacenter.', 
'TÉLÉCOMS', 'TIA', 'TIA-942-A', 'Section 5.1 - Telecommunications Infrastructure', 
'https://tiaonline.org/standards/tia-942-a/', '2014', 'primary', true, 
'ANSI/TIA-942-A-2014', 'câblage,télécoms,fibre,cuivre'),

-- Standards connexes officiels
('Sécurité Information ISO-27001', 
'Exigences systèmes management sécurité information applicables aux opérations datacenter et contrôles sécurité.', 
'SÉCURITÉ', 'ISO', 'ISO-27001', 'Clause 8.2 - Information Security Risk Assessment', 
'https://www.iso.org/standard/27001', '2013', 'connected', true, 
'ISO/IEC 27001:2013', 'sécurité,iso,risques,management'),

('Protection Foudre IEC-62305', 
'Exigences systèmes protection foudre pour installations datacenter et infrastructure télécommunications.', 
'PROTECTION', 'IEC', 'IEC-62305', 'Part 1 - Lightning Protection Principles', 
'https://www.iec.ch/publications/iec-62305', '2010', 'connected', true, 
'IEC 62305-1:2010', 'foudre,protection,paratonnerre'),

('Efficacité Énergétique ASHRAE', 
'Exigences efficacité énergétique pour systèmes chauffage, ventilation et climatisation dans bâtiments commerciaux incluant datacenters.', 
'ÉNERGIE', 'ASHRAE', 'ASHRAE-90.1', 'Section 6 - HVAC Systems', 
'https://www.ashrae.org/technical-resources/standards-and-guidelines', '2019', 'connected', true, 
'ANSI/ASHRAE/IES Standard 90.1-2019', 'énergie,hvac,efficacité,climatisation'),

('Protection Incendie NFPA-75', 
'Exigences protection incendie spécifiquement conçues pour installations équipements électroniques et centres traitement données.', 
'INCENDIE', 'NFPA', 'NFPA-75', 'Chapter 5 - Fire Protection Systems', 
'https://www.nfpa.org/codes-and-standards/nfpa-75', '2020', 'connected', true, 
'NFPA 75-2020', 'incendie,protection,détection,extinction'),

('Qualité Électrique IEEE-519', 
'Exigences qualité électrique et contrôle harmoniques dans systèmes électriques pour équipements électroniques sensibles.', 
'QUALITÉ ÉLECTRIQUE', 'IEEE', 'IEEE-519', 'Section 4 - Power Quality', 
'https://standards.ieee.org/ieee-519/', '2014', 'connected', true, 
'IEEE Std 519-2014', 'qualité,électrique,harmoniques,distorsion');

-- Création des indexes pour performance
CREATE INDEX IF NOT EXISTS idx_mcp_kb_standard_code ON mcp_knowledge_base(standard_code);
CREATE INDEX IF NOT EXISTS idx_mcp_kb_family ON mcp_knowledge_base(standard_family);
CREATE INDEX IF NOT EXISTS idx_mcp_kb_category ON mcp_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_mcp_service_mapping_category ON mcp_service_mapping(category_name);
CREATE INDEX IF NOT EXISTS idx_mcp_service_mapping_service ON mcp_service_mapping(service_id);